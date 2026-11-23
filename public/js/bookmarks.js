const bookmarkState = {
  items: [],
  editingId: null,
  search: ''
};

const bookmarkForm = document.querySelector('#bookmark-form');
const titleInput = document.querySelector('#bookmark-title');
const urlInput = document.querySelector('#bookmark-url');
const tagsInput = document.querySelector('#bookmark-tags');
const searchInput = document.querySelector('#bookmark-search');
const list = document.querySelector('#bookmark-list');
const count = document.querySelector('#bookmark-count');
const formTitle = document.querySelector('#form-title');
const formCopy = document.querySelector('#form-copy');
const submitButton = document.querySelector('#submit-button');
const cancelButton = document.querySelector('#cancel-button');

function normalizeTags(value) {
  return [...new Set(value.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 8);
}

function filteredBookmarks() {
  const term = bookmarkState.search.toLowerCase();
  if (!term) return bookmarkState.items;
  return bookmarkState.items.filter((bookmark) =>
    [bookmark.title, bookmark.url, ...bookmark.tags].some((value) => value.toLowerCase().includes(term))
  );
}

function renderBookmarks() {
  const bookmarks = filteredBookmarks();
  list.replaceChildren();
  count.textContent = `${bookmarks.length} ${bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}`;

  if (!bookmarks.length) {
    const empty = element('div', 'empty-state');
    empty.append(
      element('strong', '', bookmarkState.search ? 'No matching bookmarks' : 'Your library is ready'),
      element('span', '', bookmarkState.search ? 'Try a different search term.' : 'Add your first useful link using the form.')
    );
    list.append(empty);
    return;
  }

  bookmarks.forEach((bookmark) => {
    const card = element('article', 'entry-card');
    const title = element('h3', '', bookmark.title);
    const url = element('a', 'entry-url', bookmark.url.replace(/^https?:\/\//, ''));
    url.href = bookmark.url;
    url.target = '_blank';
    url.rel = 'noopener noreferrer';
    url.title = `Visit ${bookmark.title}`;

    const tagList = element('div', 'tag-list');
    if (bookmark.tags.length) {
      bookmark.tags.forEach((tag) => tagList.append(element('span', 'tag', tag)));
    } else {
      tagList.append(element('span', 'tag', 'untagged'));
    }

    const actions = element('div', 'card-actions');
    const visit = element('a', 'button button-primary button-icon', 'Visit');
    visit.href = bookmark.url;
    visit.target = '_blank';
    visit.rel = 'noopener noreferrer';

    const edit = element('button', 'button button-secondary button-icon', 'Edit');
    edit.type = 'button';
    edit.dataset.action = 'edit';
    edit.dataset.id = bookmark._id;

    const remove = element('button', 'button button-danger button-icon', 'Delete');
    remove.type = 'button';
    remove.dataset.action = 'delete';
    remove.dataset.id = bookmark._id;

    actions.append(visit, edit, remove);
    card.append(title, url, tagList, actions);
    list.append(card);
  });
}

function setEditing(bookmark = null) {
  bookmarkState.editingId = bookmark?._id || null;
  bookmarkForm.reset();

  if (bookmark) {
    titleInput.value = bookmark.title;
    urlInput.value = bookmark.url;
    tagsInput.value = bookmark.tags.join(', ');
    formTitle.textContent = 'Edit bookmark';
    formCopy.textContent = 'Update this saved link, or press Escape to cancel.';
    submitButton.textContent = 'Save changes';
    cancelButton.classList.remove('is-hidden');
  } else {
    formTitle.textContent = 'New bookmark';
    formCopy.textContent = 'Keep a useful page close at hand.';
    submitButton.textContent = 'Add bookmark';
    cancelButton.classList.add('is-hidden');
  }
}

async function loadBookmarks() {
  try {
    bookmarkState.items = await apiRequest('/api/bookmarks');
    renderBookmarks();
  } catch (error) {
    list.innerHTML = '';
    const errorBox = element('div', 'error-state');
    errorBox.append(element('strong', '', 'Bookmarks are temporarily offline'), element('span', '', error.message));
    list.append(errorBox);
  }
}

bookmarkForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!bookmarkForm.reportValidity()) return;

  const payload = {
    title: titleInput.value.trim(),
    url: urlInput.value.trim(),
    tags: normalizeTags(tagsInput.value)
  };

  submitButton.disabled = true;
  try {
    if (bookmarkState.editingId) {
      const updated = await apiRequest(`/api/bookmarks/${bookmarkState.editingId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      bookmarkState.items = bookmarkState.items.map((item) => item._id === updated._id ? updated : item);
      showToast('Bookmark updated.');
    } else {
      const created = await apiRequest('/api/bookmarks', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      bookmarkState.items.unshift(created);
      showToast('Bookmark added.');
    }
    setEditing();
    renderBookmarks();
    titleInput.focus();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    submitButton.disabled = false;
  }
});

list.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const bookmark = bookmarkState.items.find((item) => item._id === button.dataset.id);
  if (!bookmark) return;

  if (button.dataset.action === 'edit') {
    setEditing(bookmark);
    titleInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (!window.confirm(`Delete “${bookmark.title}”?`)) return;
  button.disabled = true;
  try {
    await apiRequest(`/api/bookmarks/${bookmark._id}`, { method: 'DELETE' });
    bookmarkState.items = bookmarkState.items.filter((item) => item._id !== bookmark._id);
    if (bookmarkState.editingId === bookmark._id) setEditing();
    renderBookmarks();
    showToast('Bookmark deleted.');
  } catch (error) {
    showToast(error.message, 'error');
    button.disabled = false;
  }
});

searchInput.addEventListener('input', () => {
  bookmarkState.search = searchInput.value.trim();
  renderBookmarks();
});

cancelButton.addEventListener('click', () => setEditing());

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && bookmarkState.editingId) {
    setEditing();
    titleInput.focus();
  }

  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    bookmarkForm.requestSubmit();
  }

  const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
  if (event.key === '/' && !isTyping) {
    event.preventDefault();
    searchInput.focus();
  }
});

loadBookmarks();

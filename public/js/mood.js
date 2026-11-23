const moodState = {
  entries: [],
  editingId: null,
  filter: 'all'
};

const moodForm = document.querySelector('#mood-form');
const dateInput = document.querySelector('#mood-date');
const noteInput = document.querySelector('#mood-note');
const moodList = document.querySelector('#mood-list');
const moodCount = document.querySelector('#mood-count');
const moodFilter = document.querySelector('#mood-filter');
const moodFormTitle = document.querySelector('#mood-form-title');
const moodFormCopy = document.querySelector('#mood-form-copy');
const moodSubmit = document.querySelector('#mood-submit');
const moodCancel = document.querySelector('#mood-cancel');

function localToday() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function moodCategory(value) {
  if (value >= 4) return 'good';
  if (value === 3) return 'neutral';
  return 'low';
}

function moodLabel(value) {
  return ['Very low', 'Low', 'Neutral', 'Good', 'Great'][value - 1];
}

function formatMoodDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(year, month - 1, day));
}

function visibleEntries() {
  return moodState.entries
    .filter((entry) => moodState.filter === 'all' || moodCategory(entry.mood) === moodState.filter)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function renderMoodEntries() {
  const entries = visibleEntries();
  moodList.replaceChildren();
  moodCount.textContent = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`;

  if (!entries.length) {
    const empty = element('div', 'empty-state');
    empty.append(
      element('strong', '', moodState.filter === 'all' ? 'Begin with today' : 'No entries in this mood range'),
      element('span', '', moodState.filter === 'all' ? 'Your daily reflections will appear here.' : 'Choose another filter to see more entries.')
    );
    moodList.append(empty);
    return;
  }

  entries.forEach((entry) => {
    const category = moodCategory(entry.mood);
    const card = element('article', `entry-card mood-${category}`);
    const meta = element('div', 'entry-meta');
    const score = element('span', 'mood-score', String(entry.mood));
    score.title = `${entry.mood} out of 5 — ${moodLabel(entry.mood)}`;
    meta.append(score, element('time', 'mood-date', formatMoodDate(entry.date)));

    const title = element('h3', '', moodLabel(entry.mood));
    const note = element('p', '', entry.note || 'No note added for this day.');
    const actions = element('div', 'card-actions');

    const edit = element('button', 'button button-secondary button-icon', 'Edit');
    edit.type = 'button';
    edit.dataset.action = 'edit';
    edit.dataset.id = entry._id;

    const remove = element('button', 'button button-danger button-icon', 'Delete');
    remove.type = 'button';
    remove.dataset.action = 'delete';
    remove.dataset.id = entry._id;

    actions.append(edit, remove);
    card.append(meta, title, note, actions);
    moodList.append(card);
  });
}

function setMoodEditing(entry = null) {
  moodState.editingId = entry?._id || null;
  moodForm.reset();

  if (entry) {
    dateInput.value = entry.date;
    moodForm.elements.mood.value = String(entry.mood);
    noteInput.value = entry.note;
    moodFormTitle.textContent = 'Edit check-in';
    moodFormCopy.textContent = 'Adjust this entry, or press Escape to cancel.';
    moodSubmit.textContent = 'Save changes';
    moodCancel.classList.remove('is-hidden');
  } else {
    dateInput.value = localToday();
    moodFormTitle.textContent = "Today's check-in";
    moodFormCopy.textContent = 'Choose the score that feels closest.';
    moodSubmit.textContent = 'Save check-in';
    moodCancel.classList.add('is-hidden');
  }
}

async function loadMoodEntries() {
  try {
    moodState.entries = await apiRequest('/api/moods');
    renderMoodEntries();
  } catch (error) {
    moodList.replaceChildren();
    const errorBox = element('div', 'error-state');
    errorBox.append(element('strong', '', 'Your journal is temporarily offline'), element('span', '', error.message));
    moodList.append(errorBox);
  }
}

moodForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!moodForm.reportValidity()) return;

  const payload = {
    date: dateInput.value,
    mood: Number(moodForm.elements.mood.value),
    note: noteInput.value.trim()
  };

  moodSubmit.disabled = true;
  try {
    if (moodState.editingId) {
      const updated = await apiRequest(`/api/moods/${moodState.editingId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      moodState.entries = moodState.entries.map((entry) => entry._id === updated._id ? updated : entry);
      showToast('Journal entry updated.');
    } else {
      const created = await apiRequest('/api/moods', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      moodState.entries.push(created);
      showToast('Today’s mood was saved.');
    }
    setMoodEditing();
    renderMoodEntries();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    moodSubmit.disabled = false;
  }
});

moodList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const entry = moodState.entries.find((item) => item._id === button.dataset.id);
  if (!entry) return;

  if (button.dataset.action === 'edit') {
    setMoodEditing(entry);
    dateInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (!window.confirm(`Delete the entry for ${formatMoodDate(entry.date)}?`)) return;
  button.disabled = true;
  try {
    await apiRequest(`/api/moods/${entry._id}`, { method: 'DELETE' });
    moodState.entries = moodState.entries.filter((item) => item._id !== entry._id);
    if (moodState.editingId === entry._id) setMoodEditing();
    renderMoodEntries();
    showToast('Journal entry deleted.');
  } catch (error) {
    showToast(error.message, 'error');
    button.disabled = false;
  }
});

moodFilter.addEventListener('change', () => {
  moodState.filter = moodFilter.value;
  renderMoodEntries();
});

moodCancel.addEventListener('click', () => setMoodEditing());
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && moodState.editingId) setMoodEditing();
});

setMoodEditing();
loadMoodEntries();

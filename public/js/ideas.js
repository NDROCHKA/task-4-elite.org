const ideaState = {
  ideas: [],
  editingId: null,
  typeFilter: 'all',
  statusFilter: 'all'
};

const ideaForm = document.querySelector('#idea-form');
const ideaTitle = document.querySelector('#idea-title');
const ideaDescription = document.querySelector('#idea-description');
const ideaType = document.querySelector('#idea-type');
const ideaStatus = document.querySelector('#idea-status');
const ideaList = document.querySelector('#idea-list');
const ideaCount = document.querySelector('#idea-count');
const ideaFormTitle = document.querySelector('#idea-form-title');
const ideaFormCopy = document.querySelector('#idea-form-copy');
const ideaSubmit = document.querySelector('#idea-submit');
const ideaCancel = document.querySelector('#idea-cancel');
const typeFilter = document.querySelector('#type-filter');
const statusFilter = document.querySelector('#status-filter');

function visibleIdeas() {
  return ideaState.ideas.filter((idea) => {
    const typeMatches = ideaState.typeFilter === 'all' || idea.type === ideaState.typeFilter;
    const statusMatches = ideaState.statusFilter === 'all' || idea.status === ideaState.statusFilter;
    return typeMatches && statusMatches;
  });
}

function renderIdeas() {
  const ideas = visibleIdeas();
  ideaList.replaceChildren();
  ideaCount.textContent = `${ideas.length} ${ideas.length === 1 ? 'idea' : 'ideas'}`;

  if (!ideas.length) {
    const filtering = ideaState.typeFilter !== 'all' || ideaState.statusFilter !== 'all';
    const empty = element('div', 'empty-state');
    empty.append(
      element('strong', '', filtering ? 'No ideas match these filters' : 'Make room for your next idea'),
      element('span', '', filtering ? 'Try changing the type or status.' : 'Capture the first spark using the form.')
    );
    ideaList.append(empty);
    return;
  }

  ideas.forEach((idea) => {
    const card = element('article', 'entry-card');
    const meta = element('div', 'entry-meta');
    meta.append(
      element('span', `badge badge-${idea.type.toLowerCase()}`, idea.type),
      element('span', `badge badge-${idea.status.toLowerCase()}`, idea.status)
    );

    const title = element('h3', '', idea.title);
    const description = element('p', 'idea-description', idea.description || 'No description added yet.');
    const actions = element('div', 'card-actions');

    const edit = element('button', 'button button-secondary button-icon', 'Edit');
    edit.type = 'button';
    edit.dataset.action = 'edit';
    edit.dataset.id = idea._id;

    const remove = element('button', 'button button-danger button-icon', 'Delete');
    remove.type = 'button';
    remove.dataset.action = 'delete';
    remove.dataset.id = idea._id;

    actions.append(edit, remove);
    card.append(meta, title, description, actions);
    ideaList.append(card);
  });
}

function setIdeaEditing(idea = null) {
  ideaState.editingId = idea?._id || null;
  ideaForm.reset();

  if (idea) {
    ideaTitle.value = idea.title;
    ideaDescription.value = idea.description;
    ideaType.value = idea.type;
    ideaStatus.value = idea.status;
    ideaFormTitle.textContent = 'Edit idea';
    ideaFormCopy.textContent = 'Shape the idea or move it along the pipeline.';
    ideaSubmit.textContent = 'Save changes';
    ideaCancel.classList.remove('is-hidden');
  } else {
    ideaFormTitle.textContent = 'Capture an idea';
    ideaFormCopy.textContent = 'Rough is welcome. You can shape it later.';
    ideaSubmit.textContent = 'Add idea';
    ideaCancel.classList.add('is-hidden');
  }
}

async function loadIdeas() {
  try {
    ideaState.ideas = await apiRequest('/api/ideas');
    renderIdeas();
  } catch (error) {
    ideaList.replaceChildren();
    const errorBox = element('div', 'error-state');
    errorBox.append(element('strong', '', 'The idea pipeline is temporarily offline'), element('span', '', error.message));
    ideaList.append(errorBox);
  }
}

ideaForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!ideaForm.reportValidity()) return;

  const payload = {
    title: ideaTitle.value.trim(),
    description: ideaDescription.value.trim(),
    type: ideaType.value,
    status: ideaStatus.value
  };

  ideaSubmit.disabled = true;
  try {
    if (ideaState.editingId) {
      const updated = await apiRequest(`/api/ideas/${ideaState.editingId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      ideaState.ideas = ideaState.ideas.map((idea) => idea._id === updated._id ? updated : idea);
      showToast('Idea updated.');
    } else {
      const created = await apiRequest('/api/ideas', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      ideaState.ideas.unshift(created);
      showToast('Idea captured.');
    }
    setIdeaEditing();
    renderIdeas();
    ideaTitle.focus();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    ideaSubmit.disabled = false;
  }
});

ideaList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const idea = ideaState.ideas.find((item) => item._id === button.dataset.id);
  if (!idea) return;

  if (button.dataset.action === 'edit') {
    setIdeaEditing(idea);
    ideaTitle.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (!window.confirm(`Delete “${idea.title}”?`)) return;
  button.disabled = true;
  try {
    await apiRequest(`/api/ideas/${idea._id}`, { method: 'DELETE' });
    ideaState.ideas = ideaState.ideas.filter((item) => item._id !== idea._id);
    if (ideaState.editingId === idea._id) setIdeaEditing();
    renderIdeas();
    showToast('Idea deleted.');
  } catch (error) {
    showToast(error.message, 'error');
    button.disabled = false;
  }
});

typeFilter.addEventListener('change', () => {
  ideaState.typeFilter = typeFilter.value;
  renderIdeas();
});

statusFilter.addEventListener('change', () => {
  ideaState.statusFilter = statusFilter.value;
  renderIdeas();
});

ideaCancel.addEventListener('click', () => setIdeaEditing());
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && ideaState.editingId) setIdeaEditing();
});

loadIdeas();

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}.`);
  }
  return data;
}

function showToast(message, type = 'success') {
  let region = document.querySelector('.toast-region');
  if (!region) {
    region = document.createElement('div');
    region.className = 'toast-region';
    region.setAttribute('aria-live', 'polite');
    document.body.append(region);
  }

  const toast = document.createElement('div');
  toast.className = `toast${type === 'error' ? ' is-error' : ''}`;
  toast.textContent = message;
  region.append(toast);

  window.setTimeout(() => toast.remove(), 3600);
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function updateDatabaseStatus() {
  const status = document.querySelector('#database-status');
  if (!status) return;

  try {
    const health = await apiRequest('/api/health');
    const connected = health.database === 'connected';
    status.classList.add(connected ? 'is-online' : 'is-offline');
    status.lastChild.textContent = connected ? ' Database online' : ' Database offline';
  } catch {
    status.classList.add('is-offline');
    status.lastChild.textContent = ' Server unavailable';
  }
}

updateDatabaseStatus();

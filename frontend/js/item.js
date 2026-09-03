const API_URL = 'http://3.120.130.136:5000/api/items';

const params = new URLSearchParams(window.location.search);
const itemId = params.get('id');

const loadingMessage = document.getElementById('loading-message');
const itemDetail = document.getElementById('item-detail');
const notFoundMessage = document.getElementById('not-found-message');
const actionMessage = document.getElementById('action-message');
const resolveButton = document.getElementById('resolve-button');
const deleteButton = document.getElementById('delete-button');

let currentItem = null;

async function fetchItem() {
  if (!itemId) {
    showNotFound();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${itemId}`);

    if (!response.ok) {
      showNotFound();
      return;
    }

    currentItem = await response.json();
    renderItem(currentItem);

  } catch (error) {
    showNotFound();
  }
}

function renderItem(item) {
  document.getElementById('detail-name').textContent = item.itemName;

  const typeBadge = document.getElementById('detail-type');
  typeBadge.textContent = item.type;
  typeBadge.className = 'badge ' + (item.type === 'lost' ? 'badge-lost' : 'badge-found');

  document.getElementById('detail-category').textContent = item.category;
  document.getElementById('detail-location').textContent = item.location;
  document.getElementById('detail-date').textContent = new Date(item.date).toLocaleDateString();
  document.getElementById('detail-description').textContent = item.description;
  document.getElementById('detail-contact').textContent = item.contactInfo || 'Not provided';
  document.getElementById('detail-status').textContent = item.status;

  if (item.status === 'resolved') {
    resolveButton.disabled = true;
    resolveButton.textContent = 'Already Resolved';
  }

  loadingMessage.hidden = true;
  itemDetail.hidden = false;
}

function showNotFound() {
  loadingMessage.hidden = true;
  notFoundMessage.hidden = false;
}

resolveButton.addEventListener('click', async () => {
  try {
    const response = await fetch(`${API_URL}/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'resolved' })
    });

    if (!response.ok) {
      throw new Error('Could not update item.');
    }

    currentItem = await response.json();
    renderItem(currentItem);
    showActionMessage('Marked as resolved.', 'success');

  } catch (error) {
    showActionMessage(error.message, 'error');
  }
});

deleteButton.addEventListener('click', async () => {
  const confirmed = confirm('Are you sure you want to delete this item? This cannot be undone.');
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_URL}/${itemId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Could not delete item.');
    }

    window.location.href = 'index.html';

  } catch (error) {
    showActionMessage(error.message, 'error');
  }
});

function showActionMessage(text, type) {
  actionMessage.textContent = text;
  actionMessage.className = 'form-message ' + type;
  actionMessage.hidden = false;
}

fetchItem();
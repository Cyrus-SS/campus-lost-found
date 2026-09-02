const API_URL = 'http://54.159.93.13:5000/api/items';

const itemsGrid = document.getElementById('items-grid');
const emptyState = document.getElementById('empty-state');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');

let allItems = [];
let currentFilter = 'all';
let currentSearch = '';

// Fetch all items from the backend when the page loads
async function fetchItems() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    allItems = data;
    renderItems();
  } catch (error) {
    itemsGrid.innerHTML = '';
    emptyState.hidden = false;
    emptyState.querySelector('.empty-state-title').textContent = 'Could not load items.';
    emptyState.querySelector('.empty-state-text').textContent = 'Make sure the backend server is running.';
  }
}

// Apply the current filter + search term, then display the results
function renderItems() {
  let filtered = allItems;

  if (currentFilter !== 'all') {
    filtered = filtered.filter((item) => item.type === currentFilter);
  }

  if (currentSearch.trim() !== '') {
    const term = currentSearch.toLowerCase();
    filtered = filtered.filter((item) =>
      item.itemName.toLowerCase().includes(term) ||
      item.location.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
  }

  itemsGrid.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  filtered.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'item-card' + (item.status === 'resolved' ? ' status-resolved' : '');

    const formattedDate = new Date(item.date).toLocaleDateString();

    card.innerHTML = `
      <div class="item-card-header">
        <span class="item-card-name">${escapeHtml(item.itemName)}</span>
        <span class="badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}">${item.type}</span>
      </div>
      <div class="item-card-meta">${escapeHtml(item.category)} &middot; ${escapeHtml(item.location)} &middot; ${formattedDate}</div>
      <div class="item-card-desc">${escapeHtml(item.description)}</div>
      <a href="item.html?id=${item._id}" class="item-card-link">View details &rarr;</a>
    `;

    itemsGrid.appendChild(card);
  });
}

// Basic protection against HTML injection when inserting text into the page
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Handle search form submission
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  currentSearch = searchInput.value;
  renderItems();
});

// Handle filter button clicks
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    currentFilter = button.dataset.filter;
    renderItems();
  });
});

fetchItems();
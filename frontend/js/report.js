const API_URL = 'http://localhost:8088/api/items';

const reportForm = document.getElementById('report-form');
const formMessage = document.getElementById('form-message');

reportForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(reportForm);
  const newItem = {
    itemName: formData.get('itemName'),
    type: formData.get('type'),
    category: formData.get('category'),
    location: formData.get('location'),
    date: formData.get('date'),
    description: formData.get('description'),
    contactInfo: formData.get('contactInfo')
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newItem)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong.');
    }

    showMessage('Item reported successfully! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);

  } catch (error) {
    showMessage(error.message, 'error');
  }
});

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = 'form-message ' + type;
  formMessage.hidden = false;
}
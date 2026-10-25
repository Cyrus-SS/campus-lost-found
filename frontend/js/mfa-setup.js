const AUTH_URL = 'http://localhost:8088/api/auth';
const token = sessionStorage.getItem('token');

const formMessage = document.getElementById('form-message');
const qrImg = document.getElementById('qr');
const confirmField = document.getElementById('confirm-field');

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = 'form-message ' + type;
  formMessage.hidden = false;
}

async function post(path, body) {
  const response = await fetch(AUTH_URL + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify(body || {})
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}

document.getElementById('setup-btn').addEventListener('click', async () => {
  try {
    const data = await post('/mfa/setup');
    qrImg.src = data.qr;
    qrImg.style.display = 'block';
    confirmField.style.display = 'block';
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

document.getElementById('confirm-btn').addEventListener('click', async () => {
  try {
    const data = await post('/mfa/confirm', { code: document.getElementById('code').value });
    showMessage(data.message + '. You will be asked for a code at your next login.', 'success');
  } catch (error) {
    showMessage(error.message, 'error');
  }
});
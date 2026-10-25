const AUTH_URL = 'http://localhost:8088/api/auth';

const loginForm = document.getElementById('login-form');
const formMessage = document.getElementById('form-message');
const codeField = document.getElementById('code-field');
let mfaToken = null;

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);

  const url = mfaToken ? AUTH_URL + '/login/mfa' : AUTH_URL + '/login';
  const body = mfaToken
    ? { mfaToken, code: formData.get('code') }
    : { username: formData.get('username'), password: formData.get('password') };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed.');
    }

    if (data.mfaRequired) {
      mfaToken = data.mfaToken;
      codeField.style.display = 'block';
      showMessage('Enter the 6-digit code from your authenticator app.', 'success');
      return;
    }

    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('role', data.role);
    showMessage('Login successful. Redirecting...', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);

  } catch (error) {
    showMessage(error.message, 'error');
  }
});

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = 'form-message ' + type;
  formMessage.hidden = false;
}
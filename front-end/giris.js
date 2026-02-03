const formTitle = document.getElementById('formTitle');
const authForm = document.getElementById('authForm');
const toggleBtn = document.getElementById('toggleBtn');
const toggleText = document.getElementById('toggleText');
const messageDiv = document.getElementById('message');
const usernameField = document.getElementById('usernameField');
const emailField = document.getElementById('emailField');
const submitBtn = document.getElementById('submitBtn');

let isLoginMode = true; 

function clearMessage() {
  messageDiv.textContent = '';
}

function showMessage(msg, isError = true) {
  messageDiv.style.color = isError ? 'red' : 'green';
  messageDiv.textContent = msg;
}

function updateForm() {
  if (isLoginMode) {
    formTitle.textContent = 'Giriş Yap';
    emailField.classList.add('hidden');
    submitBtn.textContent = 'Giriş Yap';
    toggleBtn.textContent = 'Kayıt Ol';
    toggleBtn.setAttribute('aria-expanded', 'false');
  } else {
    formTitle.textContent = 'Kayıt Ol';
    emailField.classList.remove('hidden');
    submitBtn.textContent = 'Kayıt Ol';
    toggleBtn.textContent = 'Giriş Yap';
    toggleBtn.setAttribute('aria-expanded', 'true');
  }
}

toggleBtn.addEventListener('click', () => {
  isLoginMode = !isLoginMode;
  updateForm();
  clearMessage();
});

updateForm();

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessage();

  const email = authForm.email?.value.trim() || '';
  const password = authForm.password.value.trim();
  const username = authForm.username.value.trim();

  if (isLoginMode) {
  if (!username || !password) {
    showMessage('Lütfen tüm alanları doldurun.');
    return;
  }
} else {
  if (!username || !email || !password) {
    showMessage('Lütfen tüm alanları doldurun.');
    return;
  }
}

  try {
    let res, data;
    if (isLoginMode) {
      res = await fetch('https://film-api-42zy.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Giriş başarısız.');

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username || data.name);
      showMessage('Giriş başarılı! Yönlendiriliyorsunuz...', false);
    } else {
      res = await fetch('https://film-api-42zy.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Kayıt başarısız.');

      showMessage('Kayıt başarılı! Girişe yönlendiriliyorsunuz...', false);
    }

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);

  } catch (err) {
    showMessage(err.message || 'Bir hata oluştu.');
  }
});

document.getElementById('forgotBtn').addEventListener('click', async () => {
  const email = prompt('E-posta adresinizi girin:');
  if (!email) return;

  try {
    const res = await fetch('https://film-api-42zy.onrender.com/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    alert('Şifre sıfırlama bağlantısı e-postanıza gönderildi.');
  } catch (err) {
    alert(err.message || 'Hata oluştu.');
  }
});

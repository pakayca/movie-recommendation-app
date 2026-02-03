const form = document.getElementById('contactForm');
const successMessage = document.getElementById('successMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    alert('Lütfen tüm alanları doldurun.');
    return;
  }

  try {
    const response = await fetch('https://film-api-42zy.onrender.com/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, message })
    });

    const result = await response.json();

    if (response.ok) {
      successMessage.style.display = 'block';
      form.reset();
      setTimeout(() => {
        successMessage.style.display = 'none';
      }, 5000);
    } else {
      alert(result.message || 'Gönderim hatası.');
    }
  } catch (error) {
    console.error('Hata:', error);
    alert('Sunucuya ulaşılamadı.');
  }
});

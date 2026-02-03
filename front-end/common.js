const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  navLinks.addEventListener('click', (e) => {
    const target = e.target;

    if (target.id === 'logoutBtn') {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      renderMenu();
      window.location.reload();
    }

    if (target.id === 'profileToggle') {
      e.preventDefault();
      const profileMenu = document.getElementById('profileMenu');
      if (profileMenu) {
        profileMenu.classList.toggle('active');
      }
    }
  });
}

function renderMenu() {
  const token = localStorage.getItem('token');
  if (!navLinks) return;

  if (token) {
    navLinks.innerHTML = `
      <li><a href="haftanin-filmleri.html">Haftanın Filmleri</a></li>
      <li><a href="iletisim.html">İletişim</a></li>
      <li class="dropdown">
        <a href="#" id="profileToggle"> ♛ Profil</a>
        <ul class="dropdown-menu" id="profileMenu">
          <li><a href="listeler.html"> ☞ Listeler</a></li>
          <li><a href="#" id="logoutBtn"> ➥ Çıkış Yap</a></li>
        </ul>
      </li>
    `;
  } else {
    navLinks.innerHTML = `
      <li><a href="haftanin-filmleri.html">Haftanın Filmleri</a></li>
      <li><a href="iletisim.html">İletişim</a></li>
      <li><a href="giris.html">Üye Ol / Giriş Yap</a></li>
    `;
  }
}

document.addEventListener('DOMContentLoaded', renderMenu);

function setupFavoriteWatchlistButtons() {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  if (!isLoggedIn) {
    document.querySelectorAll('.btn-fav, .btn-watchlist').forEach(btn => {
      btn.style.display = 'none';
    });
    return;
  }

  document.querySelectorAll('.btn-fav').forEach(favBtn => {
    favBtn.onclick = async (e) => {
      e.stopPropagation();
      const movieId = favBtn.closest('.film-card')?.dataset.movieid;
      if (!movieId) return;
      try {
        const res = await fetch('https://film-api-42zy.onrender.com/api/favorite/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ movieId })
        });
        if (!res.ok) throw new Error();
        favBtn.textContent = '❤️';
        favBtn.title = 'Favorilerde';
      } catch {
        alert('Favorilere eklenirken hata oldu.');
      }
    };
  });

  document.querySelectorAll('.btn-watchlist').forEach(watchBtn => {
    watchBtn.onclick = async (e) => {
      e.stopPropagation();
      const movieId = watchBtn.closest('.film-card')?.dataset.movieid;
      if (!movieId) return;
      try {
        const res = await fetch('https://film-api-42zy.onrender.com/api/list/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ movieId })
        });
        if (!res.ok) throw new Error();
        watchBtn.textContent = '✅';
        watchBtn.title = 'İzleme listesinde';
      } catch {
        alert('Listeye eklenirken hata oldu.');
      }
    };
  });
}

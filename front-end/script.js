const categoryWrappers = {
  "popüler": "populerMovieWrapper",
  "kesin izle": "kesinIzleMovieWrapper",
  "can sıkıntısında akar": "canSikintisiMovieWrapper",
  "boş zaman eğlencesi": "bosZamanEglencesiMovieWrapper",
  "bence yaklaşma": "benceYakismazMovieWrapper",
  "hep film olmaz": "hepFilmOLmazMovieWrapper"
};

async function fetchAndRenderFilms() {
  try {
    const res = await fetch('https://film-api-42zy.onrender.com/api/films');
    if (!res.ok) throw new Error('Film yüklenemedi: ' + res.status);
    const groupedFilms = await res.json();
    const token = localStorage.getItem('token');

    for (const [category, films] of Object.entries(groupedFilms)) {
      const containerId = categoryWrappers[category];
      if (!containerId) continue;

      const container = document.getElementById(containerId);
      if (!container) continue;

      container.innerHTML = films.map(film => {
        return `
          <div class="film-card" tabindex="0" role="article" aria-label="${film.title}" data-movieid="${film._id}">
            <div class="poster-wrapper" style="position: relative;">
              <img class="movie-poster" src="${film.imageUrl}" alt="${film.title} afiş" />
              ${token ? `<button class="btn-fav" title="Favorilere ekle" style="position:absolute; top:8px; right:8px;">🤍</button>` : ''}
            </div>
            <div class="movie-info">
              ${token ? `<button class="btn-watchlist" title="İzlenecekler"><span class="icon-plus">＋</span></button>` : ''}
              <h3 class="movie-title" title="${film.title}">${film.title}</h3>
              <p class="movie-description">${film.description || 'Açıklama yok.'}</p>
              <p class="movie-meta">Yıl: ${film.year || 'Bilinmiyor'} | IMDb: ${film.rating || 'Bilinmiyor'}</p>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (error) {
    console.error(error);
  }
}

const filmModal = document.getElementById('filmModal');
const filmModalClose = document.getElementById('filmModalClose');
const filmTrailer = document.getElementById('filmTrailer');
const filmComment = document.getElementById('filmComment');

const searchModal = document.getElementById('searchModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalPoster = document.getElementById('modalPoster');
const modalDescription = document.getElementById('modalDescription');
const modalTrailer = document.getElementById('modalTrailer');
const modalComment = document.getElementById('modalComment');

function openFilmModal(trailerUrl, comment) {
  filmTrailer.src = trailerUrl;
  filmComment.textContent = comment || 'Yorum bulunmamaktadır.';
  filmModal.classList.add('active');
  filmModal.setAttribute('aria-hidden', 'false');
  filmModalClose.focus();
  document.body.style.overflow = 'hidden';
}

function closeFilmModal() {
  filmModal.classList.remove('active');
  filmModal.setAttribute('aria-hidden', 'true');
  filmTrailer.src = '';
  document.body.style.overflow = '';
}

filmModalClose.addEventListener('click', closeFilmModal);
filmModal.addEventListener('click', e => {
  if (e.target === filmModal) closeFilmModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && filmModal.classList.contains('active')) closeFilmModal();
});

function openSearchModal(film) {
  modalPoster.src = film.imageUrl || '';
  modalPoster.alt = film.title + ' afişi';
  modalDescription.textContent = film.description || 'Açıklama yok.';
  modalTrailer.src = film.trailerUrl || '';
  modalComment.textContent = film.comment || 'Yorum bulunmamaktadır.';

  searchModal.classList.add('active');
  searchModal.setAttribute('aria-hidden', 'false');
  modalCloseBtn.focus();
  document.body.style.overflow = 'hidden';
}

function closeSearchModal() {
  searchModal.classList.remove('active');
  searchModal.setAttribute('aria-hidden', 'true');
  modalTrailer.src = '';
  document.body.style.overflow = '';
}

modalCloseBtn.addEventListener('click', closeSearchModal);
searchModal.addEventListener('click', e => {
  if (e.target === searchModal) closeSearchModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && searchModal.classList.contains('active')) closeSearchModal();
});

document.body.addEventListener('click', e => {
  const card = e.target.closest('.film-card');
  if (!card) return;
  const movieId = card.dataset.movieid;
  if (!movieId) return;

  e.preventDefault();
  fetch(`https://film-api-42zy.onrender.com/api/films/${movieId}`)
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(film => {
      openFilmModal(film.trailerUrl, film.comment);
    })
    .catch(() => alert('Film verisi alınamadı.'));
});

document.querySelectorAll('.btn-arrow').forEach(button => {
  button.addEventListener('click', () => {
    const targetId = button.dataset.target;
    const container = document.getElementById(targetId);
    if (!container) return;
    const scrollAmount = 300;
    if (button.classList.contains('btn-left')) container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    else container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  fetchAndRenderFilms().then(() => {
    if (typeof setupFavoriteWatchlistButtons === 'function') setupFavoriteWatchlistButtons();
  });

  const searchForm = document.getElementById('searchForm');
  searchForm.addEventListener('submit', async e => {
    e.preventDefault();
    const query = searchForm.q.value.trim();
    if (!query) return;
    
    try {
      const res = await fetch(`https://film-api-42zy.onrender.com/api/films/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error();
      const films = await res.json();
      if (!films.length) {
        alert('Aramanıza uygun film bulunamadı.');
        return;
      }
      const film = films.find(f => f.title.toLowerCase() === query.toLowerCase()) || films[0];

      openSearchModal(film);

    } catch {
      alert('Film bulunamadı veya sunucu hatası.');
    }
  });
});

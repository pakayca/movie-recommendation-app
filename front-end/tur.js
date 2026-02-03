async function fetchAndRenderFilmsByCategory(category) {
  try {
    const res = await fetch('https://film-api-42zy.onrender.com/api/films');
    if (!res.ok) throw new Error('Film verisi alınamadı');

    const data = await res.json();
    const films = Object.values(data).flat().filter(film => film.genre.includes(category));

    const container = document.getElementById("filmContainer");
    container.innerHTML = films.map(film => `
      <div class="film-card" tabindex="0" role="article" aria-label="${film.title}" data-movieid="${film._id}">
        <img src="${film.imageUrl}" alt="${film.title} afiş" />
        ${token ? `
          <button class="btn-fav" title="Favorilere ekle">🤍</button>
          <button class="btn-watchlist" title="İzlenecekler"><span class="icon-plus">＋</span></button>
        ` : ''}
        <div class="movie-info">
          <h3 class="movie-title">${film.title}</h3>
          <p class="movie-description">${film.description || ''}</p>
          <p class="movie-meta">Yıl: ${film.year || '-'} | IMDb: ${film.rating || '-'}</p>
        </div>
      </div>
    `).join('');

    setupFavoriteWatchlistButtons();
    attachMovieCardListeners();

  } catch (err) {
    document.getElementById("filmContainer").innerHTML = `<p>Film yüklenemedi: ${err.message}</p>`;
  }
}

function attachMovieCardListeners() {
  const modal = document.getElementById("filmModal");
  const modalClose = document.getElementById("filmModalClose");
  const modalIframe = modal.querySelector("iframe");
  const modalComment = document.getElementById("filmComment");

  document.querySelectorAll('.film-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.btn-fav') || e.target.closest('.btn-watchlist')) return;
      const movieId = card.dataset.movieid;

      fetch(`https://film-api-42zy.onrender.com/api/films/${movieId}`)
        .then(res => res.json())
        .then(film => {
          modalIframe.src = film.trailerUrl || '';
          modalComment.textContent = film.comment || 'Yorum bulunamadı.';
          modal.classList.add("active");
          modal.setAttribute("aria-hidden", "false");
          modalClose.focus();
        })
        .catch(() => alert("Fragman açılırken sorun oluştu."));
    });
  });

  modalClose.addEventListener("click", () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    modalIframe.src = '';
  });

  modal.addEventListener("click", e => {
    if (e.target === modal) {
      modal.classList.remove("active");
      modalIframe.src = '';
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      modal.classList.remove("active");
      modalIframe.src = '';
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const filename = window.location.pathname.split('/').pop().replace('.html', '');
  const formatted = filename.replace(/-/g, ' ').toLowerCase();

  const reverseMap = Object.fromEntries(
  Object.entries(funnyNames).map(([key, value]) => [value.toLowerCase(), key])
);

  const genre = reverseMap[formatted];
  if (genre) {
    fetchAndRenderFilmsByCategory(genre);
  } 
});

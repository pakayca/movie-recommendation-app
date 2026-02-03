const movieList = document.getElementById('movieList');
const modal = document.getElementById("filmModal");
const modalClose = document.getElementById("filmModalClose");
const modalIframe = modal.querySelector("iframe");
const modalComment = document.getElementById("filmComment");
const token = localStorage.getItem('token');

async function fetchWeeklyFavorites() {
  try {
    const res = await fetch('https://film-api-42zy.onrender.com/api/films/weekly');
    if (!res.ok) throw new Error('API hatası');

    let movies = await res.json();

    movies = movies.slice(0, 10); 

    movieList.innerHTML = '';

    if (movies.length === 0) {
      movieList.innerHTML = '<p style="padding:1rem;text-align:center;">Bu hafta favorilere eklenen film yok.</p>';
      return;
    }

    movies.forEach(movie => {
      movieList.insertAdjacentHTML('beforeend', `
        <div class="film-card" tabindex="0" role="article" aria-label="${movie.title} filmi"
             data-trailer="${movie.trailerUrl || ''}" data-review="${movie.comment || ''}" data-movieid="${movie._id}">
          <img class="movie-poster" src="${movie.imageUrl || '/default-poster.jpg'}" alt="${movie.title} poster" />
          <div class="movie-info">
            <h2 class="movie-title" title="${movie.title}">${movie.title}</h2>
            <p class="movie-description">${movie.description || 'Açıklama yok'}</p>
            <p class="movie-meta">Yıl: ${movie.year || '-'} | Puan: ${movie.rating || '-'}</p>
          </div>
          ${token ? `
          <div class="buttons">
            <button class="btn-fav" title="Favorilere ekle">🤍</button>
            <button class="btn-watchlist" title="İzleme listesine ekle">＋</button>
          </div>
          ` : ''}
        </div>
      `);
    });

    if (typeof setupFavoriteWatchlistButtons === 'function') {
      setupFavoriteWatchlistButtons();
    }
  } catch (err) {
    console.error('Filmler getirilemedi:', err);
    movieList.innerHTML = '<p style="padding:1rem; color:red; text-align:center;">Filmler yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>';
  }
}

movieList.addEventListener("click", e => {
  const card = e.target.closest(".film-card");
  if (!card) return;
  if (e.target.closest('.btn-fav') || e.target.closest('.btn-watchlist')) return;

  const trailerUrl = card.dataset.trailer;
  const comment = card.dataset.review;

  modalIframe.src = trailerUrl || "";
  modalComment.textContent = comment || "Bu film hakkında yorum bulunmamaktadır.";
  modal.classList.add("active");
  modal.setAttribute('aria-hidden', 'false');
});

modalClose.addEventListener("click", () => {
  modal.classList.remove("active");
  modalIframe.src = "";
  modal.setAttribute('aria-hidden', 'true');
});
modal.addEventListener("click", e => {
  if (e.target === modal) {
    modal.classList.remove("active");
    modalIframe.src = "";
    modal.setAttribute('aria-hidden', 'true');
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && modal.classList.contains("active")) {
    modal.classList.remove("active");
    modalIframe.src = "";
    modal.setAttribute('aria-hidden', 'true');
  }
});

document.addEventListener("DOMContentLoaded", fetchWeeklyFavorites);

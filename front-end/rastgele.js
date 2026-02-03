const apiURL = "https://film-api-42zy.onrender.com/api/films";
const filmContainer = document.getElementById("filmContainer");
const modal = document.getElementById("filmModal");
const modalClose = document.getElementById("filmModalClose");
const modalIframe = modal.querySelector("iframe");
const modalComment = document.getElementById("filmComment");
const token = localStorage.getItem('token');

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

async function loadRandomFilms() {
  try {
    const response = await fetch(apiURL);
    const data = await response.json();
    const allFilms = Object.values(data).flat();
    const randomFilms = shuffle(allFilms).slice(0, 100);

    filmContainer.innerHTML = "";

    randomFilms.forEach(film => {
      const card = document.createElement("div");
      card.className = "film-card";
      card.dataset.trailer = film.trailerUrl || "";
      card.dataset.review = film.comment && film.comment.trim() !== "" ? film.comment : "Bu film hakkında yorum bulunmamaktadır.";
      card.dataset.movieid = film._id || film.id || "";

      card.innerHTML = `
        <img src="${film.imageUrl}" alt="${film.title}">
        ${token ? `
          <button class="btn-fav" title="Favorilere ekle">🤍</button>
          <button class="btn-watchlist" title="İzleme listesine ekle">＋</button>
        ` : ''}
        <div class="movie-info">
          <div class="movie-title">${film.title}</div>
          <div class="movie-description">${film.description || "Açıklama yok."}</div>
          <div class="movie-meta">Yıl: ${film.year || "Bilinmiyor"} | IMDb: ${film.rating !== undefined ? film.rating : "Yok"}</div>
        </div>
      `;

      filmContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Film verileri alınamadı:", error);
    filmContainer.innerHTML = "<p>Film verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>";
  }
}

filmContainer.addEventListener("click", (e) => {
  const card = e.target.closest(".film-card");
  if (!card) return;
  if (e.target.closest('.btn-fav') || e.target.closest('.btn-watchlist')) return;

  modalIframe.src = card.dataset.trailer || "";
  modalComment.textContent = card.dataset.review || "Bu film hakkında yorum bulunmamaktadır.";
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  modalClose.focus();
});

function closeModal() {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  modalIframe.src = "";
}

modalClose.addEventListener("click", closeModal);
modalClose.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    closeModal();
  }
});
modal.addEventListener("click", e => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
});

async function init() {
  await loadRandomFilms();
  setupFavoriteWatchlistButtons();
}

init();

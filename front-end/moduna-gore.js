const apiURL = "https://film-api-42zy.onrender.com/api/films";
const token = localStorage.getItem('token');

async function loadFilms() {
  try {
    const response = await fetch(apiURL);
    const data = await response.json();

    const allFilms = Object.values(data).flat();

    const selectedGenres = [
      "Komedi", "Romantik", "Aksiyon", "Dram",
      "Bilim Kurgu", "Macera", "Gizem", "Gerilim", "Animasyon",
      "Biyografi", "Spor", "Korku", "Suç", "Fantastik", "Aile"
    ];

    const funnyNames = {
      "Komedi": "Biraz Gülmek İyi Gelir",
      "Romantik": "Kalp Çarpıntıları",
      "Aksiyon": "Pataklama ve Patlama",
      "Dram": "Bazen Ağlar, Bazen Düşünürsün",
      "Bilim Kurgu": "Yeni Dünyalar Keşfet",
      "Macera": "Macera Dolu Kafalar",
      "Gizem": "Sırların Peşinde, Heyecan Dolu",
      "Gerilim": "Nefesini Tut, İzle",
      "Animasyon": "Renkli Dünyalar",
      "Biyografi": "Hayatın İzinde",
      "Spor": "Kazananın Ter Döktüğü Anlar",
      "Korku": "Kabus Ama Ekranda",
      "Suç": "Adaletten Kaçış Yok",
      "Fantastik": "Büyünün ve Efsanelerin Dünyası",
      "Aile": "Gülümseten ve Sarıp Sarmalayan Hikayeler"
    };

    const genreMap = {};
    allFilms.forEach(film => {
      film.genre.forEach(genre => {
        if (selectedGenres.includes(genre)) {
          if (!genreMap[genre]) genreMap[genre] = [];
          genreMap[genre].push(film);
        }
      });
    });

    const container = document.getElementById("categoriesContainer");
    container.innerHTML = "";

    Object.entries(genreMap).forEach(([genre, films]) => {
      const section = document.createElement("div");
      section.className = "genre-section";

      const displayGenre = funnyNames[genre] || genre;

      const title = document.createElement("h2");
      const fileName = genre.toLowerCase().replace(/\s+/g, '-').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ı/g, 'i');
      title.innerHTML = `<a href="${fileName}.html">${displayGenre}</a>`;
      section.appendChild(title);

      const wrapper = document.createElement("div");
      wrapper.className = "genre-wrapper";

      const leftBtn = document.createElement("button");
      leftBtn.className = "arrow-btn arrow-left";
      leftBtn.innerHTML = "←";

      const rightBtn = document.createElement("button");
      rightBtn.className = "arrow-btn arrow-right";
      rightBtn.innerHTML = "→";

      const filmContainer = document.createElement("div");
      filmContainer.className = "film-container";

      films.forEach(film => {
        const imdb = film.rating !== undefined ? film.rating : "IMDb yok";
        const year = film.year || "Yıl bilinmiyor";
        const comment = film.comment && film.comment.trim() !== "" ? film.comment : "Bu film hakkında yorum bulunmamaktadır.";

        const card = document.createElement("div");
        card.className = "film-card";
        card.dataset.trailer = film.trailerUrl || "";
        card.dataset.review = comment;
        card.dataset.movieid = film._id || film.id || "";  

        card.innerHTML = `
          <img src="${film.imageUrl}" alt="${film.title}">
          ${token ? `
            <button class="btn-fav" title="Favorilere ekle">🤍</button>
            <button class="btn-watchlist" title="İzleme listesine ekle">＋</button>
          ` : ''}
          <div class="title">${film.title}</div>
          <div class="description">${film.description || "Açıklama yok."}</div>
          <div class="meta">Yıl: ${year} | IMDb: ${imdb}</div>
        `;

        filmContainer.appendChild(card);
      });

      leftBtn.addEventListener("click", () => {
        filmContainer.scrollBy({ left: -300, behavior: "smooth" });
      });
      rightBtn.addEventListener("click", () => {
        filmContainer.scrollBy({ left: 300, behavior: "smooth" });
      });

      wrapper.appendChild(leftBtn);
      wrapper.appendChild(filmContainer);
      wrapper.appendChild(rightBtn);

      section.appendChild(wrapper);
      container.appendChild(section);
    });

    const modal = document.getElementById("filmModal");
    const modalClose = document.getElementById("filmModalClose");
    const modalIframe = modal.querySelector("iframe");
    const modalComment = document.getElementById("filmComment");

    container.addEventListener("click", e => {
      const card = e.target.closest(".film-card");
      if (!card || e.target.closest('.btn-fav') || e.target.closest('.btn-watchlist')) return;

      const trailerUrl = card.dataset.trailer;
      const comment = card.dataset.review;

      modalIframe.src = trailerUrl || "";
      modalComment.textContent = comment || "Bu film hakkında yorum bulunmamaktadır.";
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      modalClose.focus();
    });

    modalClose.addEventListener("click", () => {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
      modalIframe.src = "";
    });

    modal.addEventListener("click", e => {
      if (e.target === modal) {
        modal.classList.remove("active");
        modalIframe.src = "";
      }
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        modal.classList.remove("active");
        modalIframe.src = "";
      }
    });

    setupFavoriteWatchlistButtons();

  } catch (error) {
    console.error("Film verileri alınamadı:", error);
  }
}

loadFilms();

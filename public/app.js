const MOVIES_API = "/api/movies";
const SALES_API = "/api/custsales";
const FEEDBACK_API = "/api/feedback";
let currentMovies = [];
let customers = [];
let saleMovies = [];


document.addEventListener("DOMContentLoaded", async () => {
  await loadComponent("movies-section", "components/movies.html");
  await loadComponent("custsales-section", "components/custsales.html");
  await loadComponent("feedback-section", "components/feedback.html");


  document.getElementById("movieForm").addEventListener("submit", saveMovie);
  document.getElementById("saleForm").addEventListener("submit", saveSale);
  document.getElementById("feedbackForm").addEventListener("submit", saveFeedback);

  loadMovies();
  loadSales();
  loadFeedbacks();
});

function extractRuntimeNumber(runtime) {
  if (!runtime) return "";

  return String(runtime).replace("min", "").trim();
}

async function loadComponent(containerId, filePath) {
  const response = await fetch(filePath);
  const html = await response.text();
  document.getElementById(containerId).innerHTML = html;
}

function showPage(pageName) {
  const moviesPage = document.getElementById("movies-page");
  const salesPage = document.getElementById("sales-page");
  const feedbackPage = document.getElementById("feedback-page");

  const moviesButton = document.getElementById("moviesNavButton");
  const salesButton = document.getElementById("salesNavButton");
  const feedbackButton = document.getElementById("feedbackNavButton");

  moviesPage.classList.remove("active-page");
  salesPage.classList.remove("active-page");
  feedbackPage.classList.remove("active-page");

  moviesButton.classList.remove("active");
  salesButton.classList.remove("active");
  feedbackButton.classList.remove("active");

  if (pageName === "movies") {
    moviesPage.classList.add("active-page");
    moviesButton.classList.add("active");
    loadMovies();
  }

  if (pageName === "sales") {
    salesPage.classList.add("active-page");
    salesButton.classList.add("active");
    loadSales();
  }

  if (pageName === "feedback") {
    feedbackPage.classList.add("active-page");
    feedbackButton.classList.add("active");
    loadFeedbacks();
  }
}

async function loadMovies() {
  try {
    const search = document.getElementById("searchMovie").value.trim();
    const genre = document.getElementById("searchGenre").value.trim();

    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (genre) params.append("genre", genre);

    const response = await fetch(`${MOVIES_API}?${params.toString()}`);
    const movies = await response.json();

    currentMovies = movies;

    loadGenreOptions();

    const tableBody = document.getElementById("moviesTableBody");
    tableBody.innerHTML = "";

    movies.forEach((movie) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${movie._id}</td>
        <td>${movie.sku || ""}</td>
        <td>${movie.title || ""}</td>
        <td>${movie.year || ""}</td>
        <td>${movie.genre?.name || ""}</td>
        <td>${movie.cast || ""}</td>
        <td>${movie.studio || ""}</td>
        <td>${movie.runtime || ""}</td>
        <td>$${movie.listPrice || 0}</td>
        <td class="actions">
          <button type="button" onclick='editMovie(${safeJson(movie)})'>Editar</button>
          <button type="button" class="danger-button" onclick='deleteMovie("${movie._id}")'>Eliminar</button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    alert("Error al cargar películas");
    console.error(error);
  }
}
// Opciones de Género, si no exsite el género se genera el ID correspondiente
function getExistingGenres() {
  const genresMap = new Map();

  currentMovies.forEach((movie) => {
    if (movie.genre?.genreId && movie.genre?.name) {
      genresMap.set(movie.genre.genreId, movie.genre.name);
    }
  });

  return Array.from(genresMap, ([genreId, name]) => ({
    genreId,
    name
  })).sort((a, b) => a.genreId - b.genreId);
}

function loadGenreOptions() {
  const genreSelect = document.getElementById("genreSelect");

  if (!genreSelect) return;

  const selectedValue = genreSelect.value;
  const genres = getExistingGenres();

  genreSelect.innerHTML = `
    <option value="">Selecciona un género</option>
  `;

  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre.genreId;
    option.textContent = genre.name;
    genreSelect.appendChild(option);
  });

  const otherOption = document.createElement("option");
  otherOption.value = "other";
  otherOption.textContent = "Otro";
  genreSelect.appendChild(otherOption);

  genreSelect.value = selectedValue;
}

function handleGenreChange() {
  const genreSelect = document.getElementById("genreSelect");
  const newGenreField = document.getElementById("newGenreField");
  const newGenreName = document.getElementById("newGenreName");

  if (genreSelect.value === "other") {
    newGenreField.classList.remove("hidden");
    newGenreName.required = true;
  } else {
    newGenreField.classList.add("hidden");
    newGenreName.required = false;
    newGenreName.value = "";
  }
}

function getNextGenreId() {
  const genres = getExistingGenres();

  if (genres.length === 0) {
    return 1;
  }

  const maxGenreId = Math.max(...genres.map((genre) => Number(genre.genreId)));

  return maxGenreId + 1;
}

function getSelectedGenreData() {
  const genreSelect = document.getElementById("genreSelect");
  const newGenreName = document.getElementById("newGenreName");

  if (genreSelect.value === "other") {
    return {
      genreId: getNextGenreId(),
      genreName: newGenreName.value.trim()
    };
  }

  const selectedOption = genreSelect.options[genreSelect.selectedIndex];

  return {
    genreId: Number(genreSelect.value),
    genreName: selectedOption.textContent
  };
}

async function saveMovie(event) {
  event.preventDefault();

  const movieId = document.getElementById("movieId").value;
  const genreData = getSelectedGenreData();

  if (!genreData.genreName) {
    alert("Selecciona o escribe un género");
    return;
  }

  const movieData = {
    title: document.getElementById("title").value.trim(),
    year: Number(document.getElementById("year").value),
    genreId: genreData.genreId,
    genreName: genreData.genreName,
    cast: document.getElementById("cast").value.trim(),
    crew: document.getElementById("crew").value.trim(),
    studio: document.getElementById("studio").value.trim(),
    runtime: Number(document.getElementById("runtime").value),
    listPrice: Number(document.getElementById("listPrice").value),
    gross: document.getElementById("gross").value.trim(),
    views: Number(document.getElementById("views").value || 0),
    awards: document.getElementById("awards").value.trim() || "None",
    budget: document.getElementById("budget").value.trim(),
    nominations: document.getElementById("nominations").value.trim() || "None",
    mainSubject: document.getElementById("mainSubject").value.trim(),
    openingDate: document.getElementById("openingDate").value,
    summary: document.getElementById("summary").value.trim()
  };

  try {
    const url = movieId ? `${MOVIES_API}/${movieId}` : MOVIES_API;
    const method = movieId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(movieData)
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "No se pudo guardar la película");
      return;
    }

    closeMovieModal();
    loadMovies();
  } catch (error) {
    alert("Error al guardar película");
    console.error(error);
  }
}

function openMovieModal() {
  resetMovieForm();
  loadGenreOptions();

  document.getElementById("movieModalTitle").textContent = "Nueva película";
  document.getElementById("movieModal").classList.remove("hidden");
}

function closeMovieModal() {
  document.getElementById("movieModal").classList.add("hidden");
  resetMovieForm();
}

function editMovie(movie) {
    showPage("movies");

    document.getElementById("movieModalTitle").textContent = "Editar película";
    document.getElementById("movieModal").classList.remove("hidden");

    document.getElementById("movieId").value = movie._id;
    document.getElementById("title").value = movie.title || "";
    document.getElementById("year").value = movie.year || "";
    document.getElementById("cast").value = movie.cast || "";
    document.getElementById("crew").value = movie.crew || "";
    document.getElementById("studio").value = movie.studio || "";
    document.getElementById("runtime").value = extractRuntimeNumber(movie.runtime);
    document.getElementById("listPrice").value = movie.listPrice || "";
    document.getElementById("gross").value = movie.gross || "";
    document.getElementById("views").value = movie.views || "";
    document.getElementById("awards").value = movie.awards || "";
    document.getElementById("budget").value = movie.budget || "";
    document.getElementById("nominations").value = movie.nominations || "";
    document.getElementById("mainSubject").value = movie.mainSubject || "";
    document.getElementById("openingDate").value = movie.openingDate || "";
    document.getElementById("summary").value = movie.summary || "";

    loadGenreOptions();

    const genreSelect = document.getElementById("genreSelect");
    const newGenreField = document.getElementById("newGenreField");
    const newGenreName = document.getElementById("newGenreName");

    const genreId = movie.genre?.genreId;

    const existsInSelect = Array.from(genreSelect.options).some(
    option => option.value === String(genreId)
    );

    if (existsInSelect) {
    genreSelect.value = String(genreId);
    newGenreField.classList.add("hidden");
    newGenreName.required = false;
    newGenreName.value = "";
    } else {
    genreSelect.value = "other";
    newGenreField.classList.remove("hidden");
    newGenreName.required = true;
    newGenreName.value = movie.genre?.name || "";
    }
}

async function deleteMovie(id) {
  const confirmDelete = confirm("¿Seguro que quieres eliminar esta película?");

  if (!confirmDelete) return;

  try {
    const response = await fetch(`${MOVIES_API}/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "No se pudo eliminar la película");
      return;
    }

    loadMovies();
    loadSales();
  } catch (error) {
    alert("Error al eliminar película");
    console.error(error);
  }
}

function resetMovieForm() {
  document.getElementById("movieForm").reset();
  document.getElementById("movieId").value = "";

  const newGenreField = document.getElementById("newGenreField");
  const newGenreName = document.getElementById("newGenreName");

  newGenreField.classList.add("hidden");
  newGenreName.required = false;
  newGenreName.value = "";
}

function clearMovieFilters() {
  document.getElementById("searchMovie").value = "";
  document.getElementById("searchGenre").value = "";
  loadMovies();
}

async function loadSales() {
  try {
    const customerName = document.getElementById("filterCustomerName").value.trim();
    const movieTitle = document.getElementById("filterMovieTitle").value.trim();
    const paymentMethod = document.getElementById("filterPaymentMethod").value.trim();

    const params = new URLSearchParams();

    if (customerName) params.append("customerName", customerName);
    if (movieTitle) params.append("movieTitle", movieTitle);
    if (paymentMethod) params.append("paymentMethod", paymentMethod);

    const response = await fetch(`${SALES_API}?${params.toString()}`);
    const sales = await response.json();

    const tableBody = document.getElementById("salesTableBody");
    tableBody.innerHTML = "";

    sales.forEach((sale) => {
      const customerName = sale.customer
        ? `${sale.customer.firstName || ""} ${sale.customer.lastName || ""}`.trim()
        : `Cliente ${sale.custId}`;

      const movieTitle = sale.movie
        ? sale.movie.title
        : `Película ${sale.movieId}`;

      const activity = sale.activityContext?.activity || "";
      const activityTime = formatDateTime(sale.activityContext?.activityTime);

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${sale._id}</td>
        <td>${customerName}</td>
        <td>${movieTitle}</td>
        <td>${sale.dayId || ""}</td>
        <td>${sale.app || ""}</td>
        <td>${sale.device || ""} / ${sale.os || ""}</td>
        <td>${sale.paymentMethod || ""}</td>
        <td>$${sale.actualPrice || 0}</td>
        <td>${activity} ${activityTime ? `<br><span class="muted">${activityTime}</span>` : ""}</td>
        <td class="actions">
          <button type="button" onclick='editSale(${safeJson(sale)})'>Editar</button>
          <button type="button" class="danger-button" onclick='deleteSale("${sale._id}")'>Eliminar</button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    alert("Error al cargar ventas");
    console.error(error);
  }
}

async function loadSaleOptions() {
  try {
    const response = await fetch(`${SALES_API}/options`);
    const data = await response.json();

    customers = data.customers || [];
    saleMovies = data.movies || [];

    fillCustomerSelect();
    fillMovieSelect();
  } catch (error) {
    alert("Error al cargar clientes y películas");
    console.error(error);
  }
}

function fillCustomerSelect() {
  const select = document.getElementById("saleCustomerSelect");

  if (!select) return;

  select.innerHTML = `<option value="">Selecciona un cliente</option>`;

  customers.forEach((customer) => {
    const option = document.createElement("option");

    option.value = customer._id;
    option.textContent = `${customer.firstName || ""} ${customer.lastName || ""}`.trim();

    select.appendChild(option);
  });
}

function fillMovieSelect() {
  const select = document.getElementById("saleMovieSelect");

  if (!select) return;

  select.innerHTML = `<option value="">Selecciona una película</option>`;

  saleMovies.forEach((movie) => {
    const option = document.createElement("option");

    option.value = movie._id;
    option.textContent = movie.title || `Película ${movie._id}`;
    option.dataset.price = movie.listPrice || 0;

    select.appendChild(option);
  });
}

function openSaleModal() {
  resetSaleForm();
  loadSaleOptions();

  document.getElementById("saleModalTitle").textContent = "Nueva venta";
  document.getElementById("saleModal").classList.remove("hidden");
}

function closeSaleModal() {
  document.getElementById("saleModal").classList.add("hidden");
  resetSaleForm();
}

function handleMoviePriceChange() {
  const movieSelect = document.getElementById("saleMovieSelect");
  const selectedOption = movieSelect.options[movieSelect.selectedIndex];

  if (!selectedOption) return;

  const price = Number(selectedOption.dataset.price || 0);

  if (price > 0) {
    document.getElementById("saleListPrice").value = price;
    calculateActualPrice();
  }
}

function calculateActualPrice() {
  const listPrice = Number(document.getElementById("saleListPrice").value || 0);
  const discountPercent = Number(document.getElementById("discountPercent").value || 0);

  const actualPrice = listPrice - (listPrice * discountPercent / 100);

  document.getElementById("actualPrice").value = actualPrice.toFixed(2);
}

async function saveSale(event) {
  event.preventDefault();

  const saleId = document.getElementById("saleId").value;

  const saleData = {
    dayId: document.getElementById("dayId").value,
    custId: Number(document.getElementById("saleCustomerSelect").value),
    movieId: Number(document.getElementById("saleMovieSelect").value),
    app: document.getElementById("saleApp").value.trim(),
    device: document.getElementById("saleDevice").value.trim(),
    os: document.getElementById("saleOs").value.trim(),
    paymentMethod: document.getElementById("paymentMethod").value.trim(),
    listPrice: Number(document.getElementById("saleListPrice").value),
    discountType: document.getElementById("discountType").value.trim(),
    discountPercent: Number(document.getElementById("discountPercent").value),
    actualPrice: Number(document.getElementById("actualPrice").value),
    activityTime: document.getElementById("activityTime").value
  };

  try {
    const url = saleId ? `${SALES_API}/${saleId}` : SALES_API;
    const method = saleId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(saleData)
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "No se pudo guardar la venta");
      return;
    }

    closeSaleModal();
    loadSales();
  } catch (error) {
    alert("Error al guardar venta");
    console.error(error);
  }
}

async function editSale(sale) {
  showPage("sales");

  document.getElementById("saleModalTitle").textContent = "Editar venta";
  document.getElementById("saleModal").classList.remove("hidden");

  await loadSaleOptions();

  document.getElementById("saleId").value = sale._id;
  document.getElementById("dayId").value = sale.dayId || "";
  document.getElementById("saleCustomerSelect").value = sale.custId || "";
  document.getElementById("saleMovieSelect").value = sale.movieId || "";
  document.getElementById("saleApp").value = sale.app || "";
  document.getElementById("saleDevice").value = sale.device || "";
  document.getElementById("saleOs").value = sale.os || "";
  document.getElementById("paymentMethod").value = sale.paymentMethod || "";
  document.getElementById("saleListPrice").value = sale.listPrice || "";
  document.getElementById("discountType").value = sale.discountType || "";
  document.getElementById("discountPercent").value = sale.discountPercent || "";
  document.getElementById("actualPrice").value = sale.actualPrice || "";

  const activityTime = sale.activityContext?.activityTime
    ? toDateTimeLocalValue(sale.activityContext.activityTime)
    : "";

  document.getElementById("activityTime").value = activityTime;
}

async function deleteSale(id) {
  const confirmDelete = confirm("¿Seguro que quieres eliminar esta venta?");

  if (!confirmDelete) return;

  try {
    const response = await fetch(`${SALES_API}/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "No se pudo eliminar la venta");
      return;
    }

    loadSales();
  } catch (error) {
    alert("Error al eliminar venta");
    console.error(error);
  }
}

function resetSaleForm() {
  document.getElementById("saleForm").reset();
  document.getElementById("saleId").value = "";
}

function clearSaleFilters() {
  document.getElementById("filterCustomerName").value = "";
  document.getElementById("filterMovieTitle").value = "";
  document.getElementById("filterPaymentMethod").value = "";
  loadSales();
}

// FEEDBACK
async function loadFeedbacks() {
  try {
    const customerName = document.getElementById("filterFeedbackCustomer").value.trim();
    const sentiment = document.getElementById("filterFeedbackSentiment").value.trim();
    const city = document.getElementById("filterFeedbackCity").value.trim();

    const params = new URLSearchParams();

    if (customerName) params.append("customerName", customerName);
    if (sentiment) params.append("sentiment", sentiment);
    if (city) params.append("city", city);

    const response = await fetch(`${FEEDBACK_API}?${params.toString()}`);
    const feedbacks = await response.json();

    const tableBody = document.getElementById("feedbackTableBody");
    tableBody.innerHTML = "";

    feedbacks.forEach((feedback) => {
      const customerName = feedback.customer
        ? `${feedback.customer.firstName || ""} ${feedback.customer.lastName || ""}`.trim()
        : `Cliente ${feedback.custId}`;

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${feedback._id}</td>
        <td>${customerName}</td>
        <td>${feedback.day || ""}</td>
        <td>${feedback.email || ""}</td>
        <td>${feedback.location?.city || ""}</td>
        <td>${feedback.customerComments || ""}</td>
        <td>${feedback.sentiment || ""}</td>
        <td class="actions">
          <button type="button" onclick='editFeedback(${safeJson(feedback)})'>Editar</button>
          <button type="button" class="danger-button" onclick='deleteFeedback("${feedback._id}")'>Eliminar</button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    alert("Error al cargar feedbacks");
    console.error(error);
  }
}

async function loadFeedbackOptions() {
  try {
    if (customers.length === 0) {
      const response = await fetch(`${FEEDBACK_API}/options`);
      const data = await response.json();
      customers = data.customers || [];
    }

    fillFeedbackCustomerSelect();
  } catch (error) {
    alert("Error al cargar clientes para feedback");
    console.error(error);
  }
}

function fillFeedbackCustomerSelect() {
  const select = document.getElementById("feedbackCustomerSelect");

  if (!select) return;

  select.innerHTML = `<option value="">Selecciona un cliente</option>`;

  customers.forEach((customer) => {
    const option = document.createElement("option");

    option.value = customer._id;
    option.textContent = `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
    option.dataset.email = customer.email || "";
    option.dataset.city = customer.contact?.city || "";
    option.dataset.stateProvince = customer.contact?.stateProvince || "";
    option.dataset.country = customer.contact?.country || "";
    option.dataset.continent = customer.contact?.continent || "";

    select.appendChild(option);
  });
}

function handleFeedbackCustomerChange() {
  const select = document.getElementById("feedbackCustomerSelect");
  const selectedOption = select.options[select.selectedIndex];

  if (!selectedOption) return;

  const custId = select.value;

  document.getElementById("feedbackUserId").value = custId
    ? `USR${String(custId).padStart(3, "0")}`
    : "";

  document.getElementById("feedbackEmail").value = selectedOption.dataset.email || "";
  document.getElementById("feedbackCity").value = selectedOption.dataset.city || "";
  document.getElementById("feedbackStateProvince").value = selectedOption.dataset.stateProvince || "";
  document.getElementById("feedbackCountry").value = selectedOption.dataset.country || "";
  document.getElementById("feedbackContinent").value = selectedOption.dataset.continent || "";
}

async function openFeedbackModal() {
  resetFeedbackForm();
  await loadFeedbackOptions();

  document.getElementById("feedbackModalTitle").textContent = "Nuevo feedback";
  document.getElementById("feedbackModal").classList.remove("hidden");
}

function closeFeedbackModal() {
  document.getElementById("feedbackModal").classList.add("hidden");
  resetFeedbackForm();
}

async function saveFeedback(event) {
  event.preventDefault();

  const feedbackId = document.getElementById("feedbackId").value;

  const feedbackData = {
    custId: Number(document.getElementById("feedbackCustomerSelect").value),
    day: document.getElementById("feedbackDay").value,
    userId: document.getElementById("feedbackUserId").value.trim(),
    email: document.getElementById("feedbackEmail").value.trim(),
    city: document.getElementById("feedbackCity").value.trim(),
    stateProvince: document.getElementById("feedbackStateProvince").value.trim(),
    country: document.getElementById("feedbackCountry").value.trim(),
    continent: document.getElementById("feedbackContinent").value.trim(),
    customerComments: document.getElementById("feedbackComments").value.trim(),
    sentiment: document.getElementById("feedbackSentiment").value
  };

  try {
    const url = feedbackId ? `${FEEDBACK_API}/${feedbackId}` : FEEDBACK_API;
    const method = feedbackId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(feedbackData)
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "No se pudo guardar el feedback");
      return;
    }

    closeFeedbackModal();
    loadFeedbacks();
  } catch (error) {
    alert("Error al guardar feedback");
    console.error(error);
  }
}

async function editFeedback(feedback) {
  showPage("feedback");

  document.getElementById("feedbackModalTitle").textContent = "Editar feedback";
  document.getElementById("feedbackModal").classList.remove("hidden");

  await loadFeedbackOptions();

  document.getElementById("feedbackId").value = feedback._id;
  document.getElementById("feedbackCustomerSelect").value = feedback.custId || "";
  document.getElementById("feedbackDay").value = feedback.day || "";
  document.getElementById("feedbackUserId").value = feedback.userId || "";
  document.getElementById("feedbackEmail").value = feedback.email || "";
  document.getElementById("feedbackCity").value = feedback.location?.city || "";
  document.getElementById("feedbackStateProvince").value = feedback.location?.stateProvince || "";
  document.getElementById("feedbackCountry").value = feedback.location?.country || "";
  document.getElementById("feedbackContinent").value = feedback.location?.continent || "";
  document.getElementById("feedbackComments").value = feedback.customerComments || "";
  document.getElementById("feedbackSentiment").value = feedback.sentiment || "";
}

async function deleteFeedback(id) {
  const confirmDelete = confirm("¿Seguro que quieres eliminar este feedback?");

  if (!confirmDelete) return;

  try {
    const response = await fetch(`${FEEDBACK_API}/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "No se pudo eliminar el feedback");
      return;
    }

    loadFeedbacks();
  } catch (error) {
    alert("Error al eliminar feedback");
    console.error(error);
  }
}

function resetFeedbackForm() {
  document.getElementById("feedbackForm").reset();
  document.getElementById("feedbackId").value = "";
}

function clearFeedbackFilters() {
  document.getElementById("filterFeedbackCustomer").value = "";
  document.getElementById("filterFeedbackSentiment").value = "";
  document.getElementById("filterFeedbackCity").value = "";
  loadFeedbacks();
}

function safeJson(data) {
  return JSON.stringify(data).replace(/'/g, "&apos;");
}

function formatDateTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("es-MX", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function toDateTimeLocalValue(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 16);
}
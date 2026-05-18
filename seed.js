require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const segments = {
  1: {
    segmentId: 1,
    name: "Young People - AGE <= 21",
    shortName: "Under 22"
  },
  2: {
    segmentId: 2,
    name: "DINKS - Double Income Kids - 21<AGE<40, Married, Household_size=2",
    shortName: "DINKS"
  },
  3: {
    segmentId: 3,
    name: "Married with Children - 21<AGE<40, Married, HHs>2",
    shortName: "Married w/Children"
  },
  4: {
    segmentId: 4,
    name: "Single Male - 21<AGE<40, Single, Male",
    shortName: "Single Male: 21-40"
  },
  5: {
    segmentId: 5,
    name: "Single Female - 21<AGE<40, Single, Female",
    shortName: "Single Female: 21-40"
  },
  6: {
    segmentId: 6,
    name: "Middle Male - 40<=AGE<55, Male",
    shortName: "Middle Male"
  },
  7: {
    segmentId: 7,
    name: "Middle Female - 40<=AGE<55, Female",
    shortName: "Middle Female"
  },
  8: {
    segmentId: 8,
    name: "Empty Nesters - 55<=AGE<70, Married",
    shortName: "Empty Nesters"
  },
  9: {
    segmentId: 9,
    name: "Mature Widowed/Divorced - 55<=AGE<70, Single",
    shortName: "Divorced/Widowed"
  },
  10: {
    segmentId: 10,
    name: "Retired - AGE>=70",
    shortName: "Retired"
  }
};

function buildCustomer({
  id,
  firstName,
  lastName,
  email,
  age,
  gender,
  city,
  stateProvince,
  country,
  segmentId,
  income,
  maritalStatus,
  householdSize
}) {
  return {
    _id: id,
    firstName,
    lastName,
    email,

    contact: {
      streetAddress: `Calle ${id} #${100 + id}`,
      postalCode: `64${String(id).padStart(3, "0")}`,
      city,
      stateProvince,
      country,
      countryCode: country === "México" ? "MX" : "US",
      continent: country === "México" ? "América" : "North America",
      yrsCustomer: (id % 5) + 1,
      promotionResponse: id % 2,
      locLat: 25.6866 + id / 100,
      locLong: -100.3161 - id / 100
    },

    demographics: {
      age,
      commuteDistance: 5 + id,
      creditBalance: 3000 + id * 250,
      education: id % 2 === 0 ? "Universidad" : "Preparatoria",
      fullTime: id % 3 === 0 ? "No" : "Yes",
      gender,
      householdSize,
      income,
      incomeLevel: income >= 30000 ? "Alto" : income >= 20000 ? "Medio" : "Bajo",
      insuffFundsIncidents: id % 3,
      jobType: id % 2 === 0 ? "Empleado" : "Independiente",
      lateMortRentPmts: id % 2,
      maritalStatus,
      mortgageAmt: id % 4 === 0 ? 750000 : 0,
      numCars: id % 3,
      numMortgages: id % 4 === 0 ? 1 : 0,
      pet: id % 2 === 0 ? "Yes" : "No",
      rentOwn: id % 4 === 0 ? "Own" : "Rent",
      workExperience: Math.max(age - 22, 1),
      yrsCurrentEmployer: id % 6,
      yrsResidence: (id % 7) + 1
    },

    segment: segments[segmentId],

    survey: {
      completedSurvey: id % 2 === 0 ? "Yes" : "No",
      rating: (id % 5) + 1,
      wouldRecommend: id % 3 === 0 ? "No" : "Yes",
      interestedInPremiumTier: id % 2 === 0 ? "Yes" : "No",
      interestedInExclusiveOfferings: id % 3 === 0 ? "No" : "Yes",
      mobileDevice: "Yes",
      television: id % 2 === 0 ? "Yes" : "No"
    }
  };
}

function buildMovie({
  id,
  title,
  year,
  genreId,
  genreName,
  cast,
  crew,
  runtime,
  listPrice,
  mainSubject,
  studio
}) {
  return {
    _id: id,
    sku: `MOV${id}`,
    title,
    cast,
    crew,
    year,
    genre: {
      genreId,
      name: genreName
    },
    gross: String(1000000 + id * 125000),
    views: 30000 + id * 1250,
    awards: id % 4 === 0 ? "Festival Selection" : "None",
    budget: String(400000 + id * 50000),
    studio,
    runtime: `${runtime} min`,
    summary: `${title} es una película de ${genreName} centrada en ${mainSubject.toLowerCase()}.`,
    imageUrl: null,
    listPrice,
    nominations: id % 3 === 0 ? "Best Original Story" : "None",
    mainSubject,
    openingDate: `${year}-01-${String((id % 27) + 1).padStart(2, "0")}`,
    wikiArticle: null,
    createdAt: "2026-01-01"
  };
}

async function seedDatabase() {
  try {
    await client.connect();

    const db = client.db("moviestream");

    await db.collection("customers").deleteMany({});
    await db.collection("movies").deleteMany({});
    await db.collection("custsales").deleteMany({});
    await db.collection("activities").deleteMany({});
    await db.collection("customerFeedback").deleteMany({});

    const customers = [
      buildCustomer({
        id: 1,
        firstName: "Ana",
        lastName: "García",
        email: "ana@email.com",
        age: 20,
        gender: "F",
        city: "Monterrey",
        stateProvince: "Nuevo León",
        country: "México",
        segmentId: 1,
        income: 15000,
        maritalStatus: "Single",
        householdSize: 1
      }),
      buildCustomer({
        id: 2,
        firstName: "Luis",
        lastName: "Pérez",
        email: "luis@email.com",
        age: 34,
        gender: "M",
        city: "Guadalajara",
        stateProvince: "Jalisco",
        country: "México",
        segmentId: 2,
        income: 32000,
        maritalStatus: "Married",
        householdSize: 2
      }),
      buildCustomer({
        id: 3,
        firstName: "María",
        lastName: "López",
        email: "maria@email.com",
        age: 25,
        gender: "F",
        city: "CDMX",
        stateProvince: "Ciudad de México",
        country: "México",
        segmentId: 5,
        income: 24000,
        maritalStatus: "Single",
        householdSize: 1
      }),
      buildCustomer({
        id: 4,
        firstName: "Carlos",
        lastName: "Ramírez",
        email: "carlos@email.com",
        age: 41,
        gender: "M",
        city: "Puebla",
        stateProvince: "Puebla",
        country: "México",
        segmentId: 6,
        income: 35000,
        maritalStatus: "Married",
        householdSize: 4
      }),
      buildCustomer({
        id: 5,
        firstName: "Sofía",
        lastName: "Torres",
        email: "sofia@email.com",
        age: 30,
        gender: "F",
        city: "Querétaro",
        stateProvince: "Querétaro",
        country: "México",
        segmentId: 2,
        income: 31000,
        maritalStatus: "Married",
        householdSize: 2
      }),
      buildCustomer({
        id: 6,
        firstName: "Diego",
        lastName: "Mendoza",
        email: "diego@email.com",
        age: 22,
        gender: "M",
        city: "Monterrey",
        stateProvince: "Nuevo León",
        country: "México",
        segmentId: 4,
        income: 18000,
        maritalStatus: "Single",
        householdSize: 1
      }),
      buildCustomer({
        id: 7,
        firstName: "Valeria",
        lastName: "Núñez",
        email: "valeria@email.com",
        age: 37,
        gender: "F",
        city: "Mérida",
        stateProvince: "Yucatán",
        country: "México",
        segmentId: 3,
        income: 29000,
        maritalStatus: "Married",
        householdSize: 4
      }),
      buildCustomer({
        id: 8,
        firstName: "Jorge",
        lastName: "Castillo",
        email: "jorge@email.com",
        age: 45,
        gender: "M",
        city: "León",
        stateProvince: "Guanajuato",
        country: "México",
        segmentId: 6,
        income: 36000,
        maritalStatus: "Married",
        householdSize: 3
      }),
      buildCustomer({
        id: 9,
        firstName: "Camila",
        lastName: "Ruiz",
        email: "camila@email.com",
        age: 27,
        gender: "F",
        city: "Tijuana",
        stateProvince: "Baja California",
        country: "México",
        segmentId: 5,
        income: 23000,
        maritalStatus: "Single",
        householdSize: 1
      }),
      buildCustomer({
        id: 10,
        firstName: "Andrés",
        lastName: "Vega",
        email: "andres@email.com",
        age: 33,
        gender: "M",
        city: "Saltillo",
        stateProvince: "Coahuila",
        country: "México",
        segmentId: 2,
        income: 33000,
        maritalStatus: "Married",
        householdSize: 2
      }),
      buildCustomer({
        id: 11,
        firstName: "Regina",
        lastName: "Flores",
        email: "regina@email.com",
        age: 29,
        gender: "F",
        city: "Monterrey",
        stateProvince: "Nuevo León",
        country: "México",
        segmentId: 5,
        income: 26000,
        maritalStatus: "Single",
        householdSize: 1
      }),
      buildCustomer({
        id: 12,
        firstName: "Mateo",
        lastName: "Santos",
        email: "mateo@email.com",
        age: 39,
        gender: "M",
        city: "Cancún",
        stateProvince: "Quintana Roo",
        country: "México",
        segmentId: 3,
        income: 34000,
        maritalStatus: "Married",
        householdSize: 4
      }),
      buildCustomer({
        id: 13,
        firstName: "Paula",
        lastName: "Herrera",
        email: "paula@email.com",
        age: 24,
        gender: "F",
        city: "Toluca",
        stateProvince: "Estado de México",
        country: "México",
        segmentId: 5,
        income: 21000,
        maritalStatus: "Single",
        householdSize: 1
      }),
      buildCustomer({
        id: 14,
        firstName: "Emilio",
        lastName: "Ortega",
        email: "emilio@email.com",
        age: 31,
        gender: "M",
        city: "Chihuahua",
        stateProvince: "Chihuahua",
        country: "México",
        segmentId: 2,
        income: 28000,
        maritalStatus: "Married",
        householdSize: 2
      }),
      buildCustomer({
        id: 15,
        firstName: "Fernanda",
        lastName: "Ríos",
        email: "fernanda@email.com",
        age: 36,
        gender: "F",
        city: "Morelia",
        stateProvince: "Michoacán",
        country: "México",
        segmentId: 3,
        income: 30000,
        maritalStatus: "Married",
        householdSize: 3
      })
    ];

    const movies = [
      buildMovie({ id: 1, title: "Ciudad Neón", year: 2021, genreId: 1, genreName: "Action", cast: "Santiago Mora, Elena Cruz", crew: "Director: Raúl Ibarra", runtime: 115, listPrice: 149, mainSubject: "Urban chase", studio: "Luma Studios" }),
      buildMovie({ id: 2, title: "La Última Señal", year: 2020, genreId: 2, genreName: "Drama", cast: "Marina Sol, Tomás Rivera", crew: "Director: Laura Núñez", runtime: 128, listPrice: 129, mainSubject: "Family conflict", studio: "Norte Films" }),
      buildMovie({ id: 3, title: "Risas en Marte", year: 2022, genreId: 3, genreName: "Comedy", cast: "Bruno Vega, Luna Pérez", crew: "Director: César Robles", runtime: 98, listPrice: 99, mainSubject: "Space comedy", studio: "Orbital Media" }),
      buildMovie({ id: 4, title: "Sombras del Lago", year: 2019, genreId: 4, genreName: "Thriller", cast: "Elena Cruz, Iván Torres", crew: "Director: Miguel Arce", runtime: 110, listPrice: 139, mainSubject: "Mystery investigation", studio: "Black Lake Films" }),
      buildMovie({ id: 5, title: "Órbita Perdida", year: 2023, genreId: 5, genreName: "Sci-Fi", cast: "Santiago Mora, Nora Díaz", crew: "Director: Julia Campos", runtime: 140, listPrice: 159, mainSubject: "Lost spaceship", studio: "Nova Pictures" }),
      buildMovie({ id: 6, title: "Fuego Interior", year: 2021, genreId: 1, genreName: "Action", cast: "Tomás Rivera, Gael Robles", crew: "Director: Álvaro Soto", runtime: 118, listPrice: 149, mainSubject: "Rescue mission", studio: "Luma Studios" }),
      buildMovie({ id: 7, title: "Cartas de Invierno", year: 2018, genreId: 2, genreName: "Drama", cast: "Marina Sol, Clara Montes", crew: "Director: Renata Gil", runtime: 124, listPrice: 119, mainSubject: "Lost letters", studio: "Norte Films" }),
      buildMovie({ id: 8, title: "Vecinos Galácticos", year: 2022, genreId: 3, genreName: "Comedy", cast: "Bruno Vega, Nora Díaz", crew: "Director: Mateo León", runtime: 101, listPrice: 99, mainSubject: "Alien neighbors", studio: "Orbital Media" }),
      buildMovie({ id: 9, title: "El Código del Silencio", year: 2020, genreId: 4, genreName: "Thriller", cast: "Iván Torres, Sofía León", crew: "Director: Daniela Rivas", runtime: 117, listPrice: 139, mainSubject: "Secret code", studio: "Black Lake Films" }),
      buildMovie({ id: 10, title: "Planeta Azul", year: 2024, genreId: 5, genreName: "Sci-Fi", cast: "Gael Robles, Luna Pérez", crew: "Director: Julia Campos", runtime: 132, listPrice: 169, mainSubject: "New planet", studio: "Nova Pictures" }),
      buildMovie({ id: 11, title: "Golpe Final", year: 2019, genreId: 1, genreName: "Action", cast: "Santiago Mora, Sofía León", crew: "Director: Raúl Ibarra", runtime: 112, listPrice: 129, mainSubject: "Final heist", studio: "Luma Studios" }),
      buildMovie({ id: 12, title: "Días de Lluvia", year: 2021, genreId: 2, genreName: "Drama", cast: "Clara Montes, Tomás Rivera", crew: "Director: Laura Núñez", runtime: 119, listPrice: 119, mainSubject: "Emotional recovery", studio: "Norte Films" }),
      buildMovie({ id: 13, title: "Café con Problemas", year: 2023, genreId: 3, genreName: "Comedy", cast: "Bruno Vega, Elena Cruz", crew: "Director: César Robles", runtime: 94, listPrice: 89, mainSubject: "Workplace chaos", studio: "Orbital Media" }),
      buildMovie({ id: 14, title: "Habitación 909", year: 2022, genreId: 4, genreName: "Thriller", cast: "Iván Torres, Marina Sol", crew: "Director: Miguel Arce", runtime: 108, listPrice: 129, mainSubject: "Hotel secret", studio: "Black Lake Films" }),
      buildMovie({ id: 15, title: "Naves de Cristal", year: 2024, genreId: 5, genreName: "Sci-Fi", cast: "Nora Díaz, Gael Robles", crew: "Director: Julia Campos", runtime: 145, listPrice: 169, mainSubject: "Future civilization", studio: "Nova Pictures" }),
      buildMovie({ id: 16, title: "Ruta Salvaje", year: 2020, genreId: 1, genreName: "Action", cast: "Sofía León, Santiago Mora", crew: "Director: Álvaro Soto", runtime: 121, listPrice: 149, mainSubject: "Desert escape", studio: "Luma Studios" }),
      buildMovie({ id: 17, title: "La Casa de Abril", year: 2019, genreId: 2, genreName: "Drama", cast: "Clara Montes, Luna Pérez", crew: "Director: Renata Gil", runtime: 116, listPrice: 109, mainSubject: "Family memories", studio: "Norte Films" }),
      buildMovie({ id: 18, title: "Manual para Sobrevivir", year: 2021, genreId: 3, genreName: "Comedy", cast: "Bruno Vega, Tomás Rivera", crew: "Director: Mateo León", runtime: 100, listPrice: 99, mainSubject: "Survival course", studio: "Orbital Media" }),
      buildMovie({ id: 19, title: "El Pasillo Oscuro", year: 2023, genreId: 4, genreName: "Thriller", cast: "Elena Cruz, Iván Torres", crew: "Director: Daniela Rivas", runtime: 113, listPrice: 139, mainSubject: "Hidden danger", studio: "Black Lake Films" }),
      buildMovie({ id: 20, title: "Memorias del Futuro", year: 2024, genreId: 5, genreName: "Sci-Fi", cast: "Nora Díaz, Marina Sol", crew: "Director: Julia Campos", runtime: 138, listPrice: 159, mainSubject: "Time memories", studio: "Nova Pictures" })
    ];

    const activities = [
      { _id: "act001", custId: 1, movieId: 1, activity: "play", activityTime: new Date("2026-01-10T18:00:00"), app: "chrome", device: "mac", os: "macos" },
      { _id: "act002", custId: 2, movieId: 3, activity: "search", activityTime: new Date("2026-01-11T19:15:00"), app: "firefox", device: "pc", os: "windows" },
      { _id: "act003", custId: 3, movieId: 5, activity: "purchase", activityTime: new Date("2026-01-12T20:30:00"), app: "safari", device: "iphone", os: "ios" },
      { _id: "act004", custId: 4, movieId: 8, activity: "play", activityTime: new Date("2026-01-13T21:10:00"), app: "edge", device: "pc", os: "windows" },
      { _id: "act005", custId: 5, movieId: 10, activity: "purchase", activityTime: new Date("2026-01-14T17:45:00"), app: "chrome", device: "mac", os: "macos" },
      { _id: "act006", custId: 6, movieId: 12, activity: "pause", activityTime: new Date("2026-01-15T16:20:00"), app: "chrome", device: "pc", os: "windows" },
      { _id: "act007", custId: 7, movieId: 15, activity: "play", activityTime: new Date("2026-01-16T22:00:00"), app: "safari", device: "iphone", os: "ios" },
      { _id: "act008", custId: 8, movieId: 2, activity: "purchase", activityTime: new Date("2026-01-17T18:35:00"), app: "firefox", device: "pc", os: "windows" },
      { _id: "act009", custId: 9, movieId: 6, activity: "search", activityTime: new Date("2026-01-18T15:50:00"), app: "chrome", device: "mac", os: "macos" },
      { _id: "act010", custId: 10, movieId: 9, activity: "play", activityTime: new Date("2026-01-19T20:00:00"), app: "edge", device: "pc", os: "windows" },
      { _id: "act011", custId: 11, movieId: 11, activity: "purchase", activityTime: new Date("2026-01-20T21:25:00"), app: "chrome", device: "mac", os: "macos" },
      { _id: "act012", custId: 12, movieId: 14, activity: "play", activityTime: new Date("2026-01-21T19:40:00"), app: "safari", device: "iphone", os: "ios" },
      { _id: "act013", custId: 13, movieId: 16, activity: "search", activityTime: new Date("2026-01-22T14:00:00"), app: "firefox", device: "pc", os: "windows" },
      { _id: "act014", custId: 14, movieId: 18, activity: "purchase", activityTime: new Date("2026-01-23T23:10:00"), app: "chrome", device: "mac", os: "macos" },
      { _id: "act015", custId: 15, movieId: 20, activity: "play", activityTime: new Date("2026-01-24T18:55:00"), app: "edge", device: "pc", os: "windows" }
    ];

    const custsales = [
      {
        _id: "sale001",
        dayId: "2026-01-12",
        custId: 3,
        movieId: 5,
        app: "safari",
        device: "iphone",
        os: "ios",
        paymentMethod: "credit card",
        listPrice: 159,
        discountType: "promotion",
        discountPercent: 10,
        actualPrice: 143.1,
        activityContext: {
          activity: "purchase",
          activityTime: new Date("2026-01-12T20:30:00"),
          app: "safari",
          device: "iphone",
          os: "ios"
        }
      },
      {
        _id: "sale002",
        dayId: "2026-01-14",
        custId: 5,
        movieId: 10,
        app: "chrome",
        device: "mac",
        os: "macos",
        paymentMethod: "debit card",
        listPrice: 169,
        discountType: "none",
        discountPercent: 0,
        actualPrice: 169,
        activityContext: {
          activity: "purchase",
          activityTime: new Date("2026-01-14T17:45:00"),
          app: "chrome",
          device: "mac",
          os: "macos"
        }
      },
      {
        _id: "sale003",
        dayId: "2026-01-17",
        custId: 8,
        movieId: 2,
        app: "firefox",
        device: "pc",
        os: "windows",
        paymentMethod: "paypal",
        listPrice: 129,
        discountType: "promotion",
        discountPercent: 15,
        actualPrice: 109.65,
        activityContext: {
          activity: "purchase",
          activityTime: new Date("2026-01-17T18:35:00"),
          app: "firefox",
          device: "pc",
          os: "windows"
        }
      },
      {
        _id: "sale004",
        dayId: "2026-01-20",
        custId: 11,
        movieId: 11,
        app: "chrome",
        device: "mac",
        os: "macos",
        paymentMethod: "credit card",
        listPrice: 129,
        discountType: "none",
        discountPercent: 0,
        actualPrice: 129,
        activityContext: {
          activity: "purchase",
          activityTime: new Date("2026-01-20T21:25:00"),
          app: "chrome",
          device: "mac",
          os: "macos"
        }
      },
      {
        _id: "sale005",
        dayId: "2026-01-23",
        custId: 14,
        movieId: 18,
        app: "chrome",
        device: "mac",
        os: "macos",
        paymentMethod: "debit card",
        listPrice: 99,
        discountType: "student",
        discountPercent: 20,
        actualPrice: 79.2,
        activityContext: {
          activity: "purchase",
          activityTime: new Date("2026-01-23T23:10:00"),
          app: "chrome",
          device: "mac",
          os: "macos"
        }
      }
    ];

    const customerFeedback = [
      {
        _id: "feedback001",
        custId: 1,
        day: "2026-01-10",
        userId: "USR001",
        email: "ana@email.com",
        location: {
          city: "Monterrey",
          stateProvince: "Nuevo León",
          country: "México",
          continent: "América"
        },
        customerComments: "La plataforma es fácil de usar, pero me gustaría ver más películas de acción.",
        sentiment: "positive"
      },
      {
        _id: "feedback002",
        custId: 3,
        day: "2026-01-12",
        userId: "USR003",
        email: "maria@email.com",
        location: {
          city: "CDMX",
          stateProvince: "Ciudad de México",
          country: "México",
          continent: "América"
        },
        customerComments: "El catálogo tiene buenas opciones, aunque la búsqueda podría ser más rápida.",
        sentiment: "neutral"
      },
      {
        _id: "feedback003",
        custId: 5,
        day: "2026-01-14",
        userId: "USR005",
        email: "sofia@email.com",
        location: {
          city: "Querétaro",
          stateProvince: "Querétaro",
          country: "México",
          continent: "América"
        },
        customerComments: "Me gustó que las recomendaciones coinciden con mis gustos.",
        sentiment: "positive"
      },
      {
        _id: "feedback004",
        custId: 8,
        day: "2026-01-17",
        userId: "USR008",
        email: "jorge@email.com",
        location: {
          city: "León",
          stateProvince: "Guanajuato",
          country: "México",
          continent: "América"
        },
        customerComments: "El proceso de compra fue claro, pero el precio final debería destacarse más.",
        sentiment: "neutral"
      },
      {
        _id: "feedback005",
        custId: 14,
        day: "2026-01-23",
        userId: "USR014",
        email: "emilio@email.com",
        location: {
          city: "Chihuahua",
          stateProvince: "Chihuahua",
          country: "México",
          continent: "América"
        },
        customerComments: "La plataforma funciona bien, pero me gustaría tener mejores filtros por género.",
        sentiment: "neutral"
      }
    ];

    await db.collection("customers").insertMany(customers);
    await db.collection("movies").insertMany(movies);
    await db.collection("activities").insertMany(activities);
    await db.collection("custsales").insertMany(custsales);
    await db.collection("customerFeedback").insertMany(customerFeedback);

    console.log("Base de datos MovieStream cargada correctamente");
  } catch (error) {
    console.error("Error al cargar la base de datos", error);
  } finally {
    await client.close();
  }
}

seedDatabase();
require("dotenv").config();
const {MongoClient} = require("mongodb");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function seedDatabase(){
    try{
        await client.connect();

        const db = client.db("moviestream");

        await db.collection("customers").deleteMany({});
        await db.collection("movies").deleteMany({});
        await db.collection("custsales").deleteMany({});
        await db.collection("activites").deleteMany({});

        const customers = [
            { _id: 1, firstName: "Ana", lastName: "García", email: "ana@email.com", age: 28, gender: "F", city: "Monterrey", country: "México", segmentId: 1 },
            { _id: 2, firstName: "Luis", lastName: "Pérez", email: "luis@email.com", age: 34, gender: "M", city: "Guadalajara", country: "México", segmentId: 2 },
            { _id: 3, firstName: "María", lastName: "López", email: "maria@email.com", age: 25, gender: "F", city: "CDMX", country: "México", segmentId: 1 },
            { _id: 4, firstName: "Carlos", lastName: "Ramírez", email: "carlos@email.com", age: 41, gender: "M", city: "Puebla", country: "México", segmentId: 3 },
            { _id: 5, firstName: "Sofía", lastName: "Torres", email: "sofia@email.com", age: 30, gender: "F", city: "Querétaro", country: "México", segmentId: 2 },
            { _id: 6, firstName: "Diego", lastName: "Mendoza", email: "diego@email.com", age: 22, gender: "M", city: "Monterrey", country: "México", segmentId: 1 },
            { _id: 7, firstName: "Valeria", lastName: "Núñez", email: "valeria@email.com", age: 37, gender: "F", city: "Mérida", country: "México", segmentId: 3 },
            { _id: 8, firstName: "Jorge", lastName: "Castillo", email: "jorge@email.com", age: 45, gender: "M", city: "León", country: "México", segmentId: 2 },
            { _id: 9, firstName: "Camila", lastName: "Ruiz", email: "camila@email.com", age: 27, gender: "F", city: "Tijuana", country: "México", segmentId: 1 },
            { _id: 10, firstName: "Andrés", lastName: "Vega", email: "andres@email.com", age: 33, gender: "M", city: "Saltillo", country: "México", segmentId: 2 },
            { _id: 11, firstName: "Regina", lastName: "Flores", email: "regina@email.com", age: 29, gender: "F", city: "Monterrey", country: "México", segmentId: 1 },
            { _id: 12, firstName: "Mateo", lastName: "Santos", email: "mateo@email.com", age: 39, gender: "M", city: "Cancún", country: "México", segmentId: 3 },
            { _id: 13, firstName: "Paula", lastName: "Herrera", email: "paula@email.com", age: 24, gender: "F", city: "Toluca", country: "México", segmentId: 1 },
            { _id: 14, firstName: "Emilio", lastName: "Ortega", email: "emilio@email.com", age: 31, gender: "M", city: "Chihuahua", country: "México", segmentId: 2 },
            { _id: 15, firstName: "Fernanda", lastName: "Ríos", email: "fernanda@email.com", age: 36, gender: "F", city: "Morelia", country: "México", segmentId: 3 }
        ];

        const movies = [
            { _id: 1, title: "Ciudad Neón", year: 2021, genre: { genreId: 1, name: "Action" }, actors: ["Santiago Mora", "Elena Cruz"], runtime: 115, listPrice: 149 },
            { _id: 2, title: "La Última Señal", year: 2020, genre: { genreId: 2, name: "Drama" }, actors: ["Marina Sol", "Tomás Rivera"], runtime: 128, listPrice: 129 },
            { _id: 3, title: "Risas en Marte", year: 2022, genre: { genreId: 3, name: "Comedy" }, actors: ["Bruno Vega", "Luna Pérez"], runtime: 98, listPrice: 99 },
            { _id: 4, title: "Sombras del Lago", year: 2019, genre: { genreId: 4, name: "Thriller" }, actors: ["Elena Cruz", "Iván Torres"], runtime: 110, listPrice: 139 },
            { _id: 5, title: "Órbita Perdida", year: 2023, genre: { genreId: 5, name: "Sci-Fi" }, actors: ["Santiago Mora", "Nora Díaz"], runtime: 140, listPrice: 159 },
            { _id: 6, title: "Fuego Interior", year: 2021, genre: { genreId: 1, name: "Action" }, actors: ["Tomás Rivera", "Gael Robles"], runtime: 118, listPrice: 149 },
            { _id: 7, title: "Cartas de Invierno", year: 2018, genre: { genreId: 2, name: "Drama" }, actors: ["Marina Sol", "Clara Montes"], runtime: 124, listPrice: 119 },
            { _id: 8, title: "Vecinos Galácticos", year: 2022, genre: { genreId: 3, name: "Comedy" }, actors: ["Bruno Vega", "Nora Díaz"], runtime: 101, listPrice: 99 },
            { _id: 9, title: "El Código del Silencio", year: 2020, genre: { genreId: 4, name: "Thriller" }, actors: ["Iván Torres", "Sofía León"], runtime: 117, listPrice: 139 },
            { _id: 10, title: "Planeta Azul", year: 2024, genre: { genreId: 5, name: "Sci-Fi" }, actors: ["Gael Robles", "Luna Pérez"], runtime: 132, listPrice: 169 },
            { _id: 11, title: "Golpe Final", year: 2019, genre: { genreId: 1, name: "Action" }, actors: ["Santiago Mora", "Sofía León"], runtime: 112, listPrice: 129 },
            { _id: 12, title: "Días de Lluvia", year: 2021, genre: { genreId: 2, name: "Drama" }, actors: ["Clara Montes", "Tomás Rivera"], runtime: 119, listPrice: 119 },
            { _id: 13, title: "Café con Problemas", year: 2023, genre: { genreId: 3, name: "Comedy" }, actors: ["Bruno Vega", "Elena Cruz"], runtime: 94, listPrice: 89 },
            { _id: 14, title: "Habitación 909", year: 2022, genre: { genreId: 4, name: "Thriller" }, actors: ["Iván Torres", "Marina Sol"], runtime: 108, listPrice: 129 },
            { _id: 15, title: "Naves de Cristal", year: 2024, genre: { genreId: 5, name: "Sci-Fi" }, actors: ["Nora Díaz", "Gael Robles"], runtime: 145, listPrice: 169 },
            { _id: 16, title: "Ruta Salvaje", year: 2020, genre: { genreId: 1, name: "Action" }, actors: ["Sofía León", "Santiago Mora"], runtime: 121, listPrice: 149 },
            { _id: 17, title: "La Casa de Abril", year: 2019, genre: { genreId: 2, name: "Drama" }, actors: ["Clara Montes", "Luna Pérez"], runtime: 116, listPrice: 109 },
            { _id: 18, title: "Manual para Sobrevivir", year: 2021, genre: { genreId: 3, name: "Comedy" }, actors: ["Bruno Vega", "Tomás Rivera"], runtime: 100, listPrice: 99 },
            { _id: 19, title: "El Pasillo Oscuro", year: 2023, genre: { genreId: 4, name: "Thriller" }, actors: ["Elena Cruz", "Iván Torres"], runtime: 113, listPrice: 139 },
            { _id: 20, title: "Memorias del Futuro", year: 2024, genre: { genreId: 5, name: "Sci-Fi" }, actors: ["Nora Díaz", "Marina Sol"], runtime: 138, listPrice: 159 }
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
        await db.collection("customers").insertMany(customers);
        await db.collection("movies").insertMany(movies);
        await db.collection("activites").insertMany(activities);
        await db.collection("custsales").insertMany(custsales);
        console.log("Base de datos MovieStream cargada correctamente");
    } catch (error){
        console.error("Error al cargar la base de datos", error);
    } finally {
        await client.close();
    }
}

seedDatabase();
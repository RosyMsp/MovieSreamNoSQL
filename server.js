const express = require("express");
const cors = require("cors");
const path = require("path");

const movieRoutes = require("./routes/movies.routes");
const custsalesRoutes = require("./routes/custsales.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/movies", movieRoutes);
app.use("/api/custsales", custsalesRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
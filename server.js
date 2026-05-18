const express = require("express");
const cors = require("cors");
const path = require("path");

const movieRoutes = require("./routes/movies.routes");
const custsalesRoutes = require("./routes/custsales.routes");
const feedbackRoutes = require("./routes/feedback.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/movies", movieRoutes);
app.use("/api/custsales", custsalesRoutes);
app.use("/api/feedback", feedbackRoutes);


app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
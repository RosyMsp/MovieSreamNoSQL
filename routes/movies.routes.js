const express = require("express");
const { ObjectId } = require("mongodb");
const { connectDB } = require("../db");

const router = express.Router();

function parseMovieId(id) {
  return isNaN(id) ? new ObjectId(id) : Number(id);
}

async function getNextMovieId(db) {
  const lastMovie = await db.collection("movies")
    .find({ _id: { $type: "number" } })
    .sort({ _id: -1 })
    .limit(1)
    .toArray();

  if (lastMovie.length === 0) {
    return 1;
  }

  return lastMovie[0]._id + 1;
}

function normalizeRuntime(runtime) {
  if (!runtime) return "";

  const runtimeText = String(runtime).trim();

  if (runtimeText.toLowerCase().includes("min")) {
    return runtimeText;
  }

  return `${runtimeText} min`;
}

function buildMovieDocument(reqBody, movieId) {
  const title = reqBody.title;
  const year = Number(reqBody.year);
  const genreId = Number(reqBody.genreId);
  const genreName = reqBody.genreName;
  const runtime = normalizeRuntime(reqBody.runtime);
  const listPrice = Number(reqBody.listPrice);

  const cast = reqBody.cast || reqBody.actors || "";
  const crew = reqBody.crew || "Director: Not assigned";
  const mainSubject = reqBody.mainSubject || genreName || "General";
  const studio = reqBody.studio || "MovieStream Studios";

  return {
    _id: movieId,
    sku: reqBody.sku || `MOV${movieId}`,
    title,
    cast,
    crew,
    year,
    genre: {
      genreId,
      name: genreName
    },
    gross: reqBody.gross || String(1000000 + movieId * 125000),
    views: reqBody.views ? Number(reqBody.views) : 30000 + movieId * 1250,
    awards: reqBody.awards || "None",
    budget: reqBody.budget || String(400000 + movieId * 50000),
    studio,
    runtime,
    summary: reqBody.summary || `${title} es una película de ${genreName} centrada en ${mainSubject.toLowerCase()}.`,
    imageUrl: null,
    listPrice,
    nominations: reqBody.nominations || "None",
    mainSubject,
    openingDate: reqBody.openingDate || `${year}-01-${String((movieId % 27) + 1).padStart(2, "0")}`,
    wikiArticle: null,
    createdAt: reqBody.createdAt || "2026-01-01"
  };
}

function buildMovieUpdateDocument(reqBody, movieId) {
  const movie = buildMovieDocument(reqBody, movieId);

  delete movie._id;
  delete movie.createdAt;

  return movie;
}

router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const { search, genre, studio, year } = req.query;

    const filter = {};

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (genre) {
      filter["genre.name"] = { $regex: genre, $options: "i" };
    }

    if (studio) {
      filter.studio = { $regex: studio, $options: "i" };
    }

    if (year) {
      filter.year = Number(year);
    }

    const movies = await db.collection("movies")
      .find(filter)
      .sort({ _id: 1 })
      .toArray();

    res.json(movies);
  } catch (error) {
    res.status(500).json({
      message: "Error al listar películas",
      error: error.message
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const id = req.params.id;

    const movie = await db.collection("movies").findOne({
      _id: parseMovieId(id)
    });

    if (!movie) {
      return res.status(404).json({
        message: "Película no encontrada"
      });
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener película",
      error: error.message
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const db = await connectDB();

    const nextMovieId = await getNextMovieId(db);
    const movie = buildMovieDocument(req.body, nextMovieId);

    const result = await db.collection("movies").insertOne(movie);

    res.status(201).json({
      message: "Película creada",
      id: result.insertedId
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear película",
      error: error.message
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const id = req.params.id;
    const parsedId = parseMovieId(id);

    const updatedMovie = buildMovieUpdateDocument(req.body, Number(id));

    const result = await db.collection("movies").updateOne(
      { _id: parsedId },
      { $set: updatedMovie }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Película no encontrada"
      });
    }

    res.json({
      message: "Película actualizada",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar película",
      error: error.message
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const id = req.params.id;
    const parsedId = parseMovieId(id);

    const hasSales = await db.collection("custsales").findOne({
      movieId: isNaN(id) ? id : Number(id)
    });

    if (hasSales) {
      return res.status(400).json({
        message: "No se puede eliminar esta película porque tiene ventas relacionadas"
      });
    }

    const hasActivities = await db.collection("activities").findOne({
      movieId: isNaN(id) ? id : Number(id)
    });

    if (hasActivities) {
      return res.status(400).json({
        message: "No se puede eliminar esta película porque tiene actividades relacionadas"
      });
    }

    const result = await db.collection("movies").deleteOne({
      _id: parsedId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Película no encontrada"
      });
    }

    res.json({
      message: "Película eliminada",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar película",
      error: error.message
    });
  }
});

module.exports = router;
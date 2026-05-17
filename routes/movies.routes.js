const express = require("express");
const { ObjectId } = require("mongodb");
const { connectDB } = require("../db");

const router = express.Router();

router.get("/", async(req, res) => {
    try{
        const db = await connectDB();
        const { search, genre } = req.query;

        const filter = {};

        if(search) {
            filter.title = { $regex: search, $options: "i"};
        }

        if(genre){
            filter["genre.name"] = { $regex: genre, $options: "i"};
        }

        const movies = await db.collection("movies").find(filter).toArray();

        res.json(movies);
    } catch (error) {
        res.status(500).json({message: "Error al listar peliculas", error: error.message});
    }
});

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

router.post("/", async(req, res) => {
    try{
        const db = await connectDB();

        const nextMovieId = await getNextMovieId(db);

        const movie = {
            _id: nextMovieId,
            title: req.body.title,
            year: Number(req.body.year),
            genre: {
                genreId: Number(req.body.genreId),
                name: req.body.genreName
            },
            actors: req.body.actors ? req.body.actors.split(",").map(actor => actor.trim()): [],
            runtime: Number(req.body.runtime),
            listPrice: Number(req.body.listPrice)
        };
        const result = await db.collection("movies").insertOne(movie);

        res.status(201).json({message: "Pelicula creada", id:result.insertedId});
    } catch (error){
        res.status(500).json({message: "Error al crear pelicula", error: error.message});
    }
});

router.put("/:id", async (req, res) => {
  try {
    const db = await connectDB();

    const id = req.params.id;

    const updatedMovie = {
      title: req.body.title,
      year: Number(req.body.year),
      genre: {
        genreId: Number(req.body.genreId),
        name: req.body.genreName
      },
      actors: req.body.actors ? req.body.actors.split(",").map(actor => actor.trim()) : [],
      runtime: Number(req.body.runtime),
      listPrice: Number(req.body.listPrice)
    };

    const result = await db.collection("movies").updateOne(
      { _id: isNaN(id) ? new ObjectId(id) : Number(id) },
      { $set: updatedMovie }
    );

    res.json({ message: "Película actualizada", modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar película", error: error.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const id = req.params.id;

    const hasSales = await db.collection("custsales").findOne({
      movieId: isNaN(id) ? id : Number(id)
    });

    if (hasSales) {
      return res.status(400).json({
        message: "No se puede eliminar esta película porque tiene ventas relacionadas"
      });
    }

    const result = await db.collection("movies").deleteOne({
      _id: isNaN(id) ? new ObjectId(id) : Number(id)
    });

    res.json({ message: "Película eliminada", deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar película", error: error.message });
  }
});

module.exports = router;
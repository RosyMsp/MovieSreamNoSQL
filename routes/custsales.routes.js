const express = require("express");
const { ObjectId } = require("mongodb");
const { connectDB } = require("../db");

const router = express.Router();

// Para que al momento de crear una venta, los datos se pongan automaticos
router.get("/options", async (req, res) => {
  try {
    const db = await connectDB();

    const customers = await db.collection("customers")
      .find({})
      .project({
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        contact: 1
      })
      .sort({ firstName: 1 })
      .toArray();

    const movies = await db.collection("movies")
      .find({})
      .project({
        _id: 1,
        title: 1,
        listPrice: 1,
        genre: 1
      })
      .sort({ title: 1 })
      .toArray();

    res.json({ customers, movies });
  } catch (error) {
    res.status(500).json({
      message: "Error al cargar opciones",
      error: error.message
    });
  }
});

// Filtra por nombre del cliente o titulo de pelicula
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const { customerName, movieTitle, paymentMethod } = req.query;

    const baseFilter = {};

    if (paymentMethod) {
      baseFilter.paymentMethod = { $regex: paymentMethod, $options: "i" };
    }

    const pipeline = [
      { $match: baseFilter },
      {
        $lookup: {
          from: "customers",
          localField: "custId",
          foreignField: "_id",
          as: "customer"
        }
      },
      {
        $lookup: {
          from: "movies",
          localField: "movieId",
          foreignField: "_id",
          as: "movie"
        }
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$movie",
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    const relatedFilter = {};

    if (customerName) {
      relatedFilter.$or = [
        { "customer.firstName": { $regex: customerName, $options: "i" } },
        { "customer.lastName": { $regex: customerName, $options: "i" } }
      ];
    }

    if (movieTitle) {
      relatedFilter["movie.title"] = { $regex: movieTitle, $options: "i" };
    }

    if (Object.keys(relatedFilter).length > 0) {
      pipeline.push({ $match: relatedFilter });
    }

    const sales = await db.collection("custsales").aggregate(pipeline).toArray();

    res.json(sales);
  } catch (error) {
    res.status(500).json({
      message: "Error al listar ventas",
      error: error.message
    });
  }
});

// Formato de ID de sales
async function getNextSaleId(db) {
  const lastSale = await db.collection("custsales")
    .find({ _id: { $regex: /^sale\d+$/ } })
    .sort({ _id: -1 })
    .limit(1)
    .toArray();

  if (lastSale.length === 0) {
    return "sale001";
  }

  const lastId = lastSale[0]._id;
  const lastNumber = Number(lastId.replace("sale", ""));
  const nextNumber = lastNumber + 1;

  return `sale${String(nextNumber).padStart(3, "0")}`;
}

router.post("/", async (req, res) => {
  try {
    const db = await connectDB();
    const nextSaleId = await getNextSaleId(db);

    const sale = {
      _id: nextSaleId,
      dayId: req.body.dayId,
      custId: Number(req.body.custId),
      movieId: Number(req.body.movieId),
      app: req.body.app,
      device: req.body.device,
      os: req.body.os,
      paymentMethod: req.body.paymentMethod,
      listPrice: Number(req.body.listPrice),
      discountType: req.body.discountType,
      discountPercent: Number(req.body.discountPercent),
      actualPrice: Number(req.body.actualPrice),
      activityContext: {
        activity: "purchase",
        activityTime: new Date(req.body.activityTime),
        app: req.body.app,
        device: req.body.device,
        os: req.body.os
      }
    };

    const customerExists = await db.collection("customers").findOne({ _id: sale.custId });
    const movieExists = await db.collection("movies").findOne({ _id: sale.movieId });

    if (!customerExists) {
      return res.status(400).json({ message: "El cliente referenciado no existe" });
    }

    if (!movieExists) {
      return res.status(400).json({ message: "La película referenciada no existe" });
    }

    const result = await db.collection("custsales").insertOne(sale);

    res.status(201).json({ message: "Venta creada", id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: "Error al crear venta", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const id = req.params.id;

    const updatedSale = {
      dayId: req.body.dayId,
      custId: Number(req.body.custId),
      movieId: Number(req.body.movieId),
      app: req.body.app,
      device: req.body.device,
      os: req.body.os,
      paymentMethod: req.body.paymentMethod,
      listPrice: Number(req.body.listPrice),
      discountType: req.body.discountType,
      discountPercent: Number(req.body.discountPercent),
      actualPrice: Number(req.body.actualPrice),
      activityContext: {
        activity: "purchase",
        activityTime: new Date(req.body.activityTime),
        app: req.body.app,
        device: req.body.device,
        os: req.body.os
      }
    };

    const result = await db.collection("custsales").updateOne(
      { _id: isNaN(id) ? new ObjectId(id) : id },
      { $set: updatedSale }
    );

    res.json({ message: "Venta actualizada", modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar venta", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const id = req.params.id;

    const result = await db.collection("custsales").deleteOne({
      _id: isNaN(id) ? new ObjectId(id) : id
    });

    res.json({ message: "Venta eliminada", deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar venta", error: error.message });
  }
});

module.exports = router;
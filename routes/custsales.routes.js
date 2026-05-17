const express = require("express");
const { ObjectId } = require("mongodb");
const { connectDB } = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const { custId, movieId, paymentMethod } = req.query;

    const filter = {};

    if (custId) {
      filter.custId = Number(custId);
    }

    if (movieId) {
      filter.movieId = Number(movieId);
    }

    if (paymentMethod) {
      filter.paymentMethod = { $regex: paymentMethod, $options: "i" };
    }

    const sales = await db.collection("custsales").aggregate([
      { $match: filter },
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
    ]).toArray();

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: "Error al listar ventas", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const db = await connectDB();

    const sale = {
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
const express = require("express");
const { ObjectId } = require("mongodb");
const { connectDB } = require("../db");

const router = express.Router();

function parseFeedbackId(id) {
  return id.startsWith("feedback") ? id : new ObjectId(id);
}

async function getNextFeedbackId(db) {
  const lastFeedback = await db.collection("customerFeedback")
    .find({ _id: { $regex: /^feedback\d+$/ } })
    .sort({ _id: -1 })
    .limit(1)
    .toArray();

  if (lastFeedback.length === 0) {
    return "feedback001";
  }

  const lastNumber = Number(lastFeedback[0]._id.replace("feedback", ""));
  const nextNumber = lastNumber + 1;

  return `feedback${String(nextNumber).padStart(3, "0")}`;
}

router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const { customerName, sentiment, city } = req.query;

    const pipeline = [
      {
        $lookup: {
          from: "customers",
          localField: "custId",
          foreignField: "_id",
          as: "customer"
        }
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          customerFullName: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ["$customer.firstName", ""] },
                  " ",
                  { $ifNull: ["$customer.lastName", ""] }
                ]
              }
            }
          }
        }
      }
    ];

    const filter = {};

    if (customerName) {
      filter.$or = [
        { "customer.firstName": { $regex: customerName, $options: "i" } },
        { "customer.lastName": { $regex: customerName, $options: "i" } },
        { customerFullName: { $regex: customerName, $options: "i" } }
      ];
    }

    if (sentiment) {
      filter.sentiment = { $regex: sentiment, $options: "i" };
    }

    if (city) {
      filter["location.city"] = { $regex: city, $options: "i" };
    }

    if (Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }

    pipeline.push({ $sort: { day: -1 } });

    const feedbacks = await db.collection("customerFeedback")
      .aggregate(pipeline)
      .toArray();

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({
      message: "Error al listar feedbacks",
      error: error.message
    });
  }
});

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

    res.json({ customers });
  } catch (error) {
    res.status(500).json({
      message: "Error al cargar clientes",
      error: error.message
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const db = await connectDB();

    const custId = Number(req.body.custId);

    const customer = await db.collection("customers").findOne({ _id: custId });

    if (!customer) {
      return res.status(400).json({
        message: "El cliente referenciado no existe"
      });
    }

    const nextFeedbackId = await getNextFeedbackId(db);

    const feedback = {
      _id: nextFeedbackId,
      custId,
      day: req.body.day,
      userId: req.body.userId || `USR${String(custId).padStart(3, "0")}`,
      email: req.body.email || customer.email,
      location: {
        city: req.body.city || customer.contact?.city || "",
        stateProvince: req.body.stateProvince || customer.contact?.stateProvince || "",
        country: req.body.country || customer.contact?.country || "",
        continent: req.body.continent || customer.contact?.continent || ""
      },
      customerComments: req.body.customerComments,
      sentiment: req.body.sentiment
    };

    const result = await db.collection("customerFeedback").insertOne(feedback);

    res.status(201).json({
      message: "Feedback creado",
      id: result.insertedId
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear feedback",
      error: error.message
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const id = req.params.id;
    const custId = Number(req.body.custId);

    const customer = await db.collection("customers").findOne({ _id: custId });

    if (!customer) {
      return res.status(400).json({
        message: "El cliente referenciado no existe"
      });
    }

    const updatedFeedback = {
      custId,
      day: req.body.day,
      userId: req.body.userId || `USR${String(custId).padStart(3, "0")}`,
      email: req.body.email || customer.email,
      location: {
        city: req.body.city || customer.contact?.city || "",
        stateProvince: req.body.stateProvince || customer.contact?.stateProvince || "",
        country: req.body.country || customer.contact?.country || "",
        continent: req.body.continent || customer.contact?.continent || ""
      },
      customerComments: req.body.customerComments,
      sentiment: req.body.sentiment
    };

    const result = await db.collection("customerFeedback").updateOne(
      { _id: parseFeedbackId(id) },
      { $set: updatedFeedback }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Feedback no encontrado"
      });
    }

    res.json({
      message: "Feedback actualizado",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar feedback",
      error: error.message
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const id = req.params.id;

    const result = await db.collection("customerFeedback").deleteOne({
      _id: parseFeedbackId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Feedback no encontrado"
      });
    }

    res.json({
      message: "Feedback eliminado",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar feedback",
      error: error.message
    });
  }
});

module.exports = router;
require("dotenv").config();
const { MongoClient} = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);

let db;

async function connectDB() {
    if(!db){
        await client.connect();
        db = client.db("moviestream");
        console.log("Conectado a MongoDB")
    }
    return db;
}

module.exports = { connectDB };
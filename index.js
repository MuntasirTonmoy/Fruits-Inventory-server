const express = require("express");
const cors = require("cors");
const res = require("express/lib/response");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yfl4a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const fruitsCollection = client
      .db("fruitsInventory")
      .collection("fruitsCollection");

    //get the product
    app.get("/fruits", async (req, res) => {
      const query = {};
      const cursor = fruitsCollection.find(query);
      const fruits = await cursor.toArray();
      res.send(fruits);
    });

    app.post("/inventory", async (req, res) => {
      const newItem = req.body;
      console.log("adding new item", newItem);
      const result = await fruitsCollection.insertOne(newItem);
      console.log("added in mogodb");
      res.send({ dataRecieved: "success" });
    });

    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await fruitsCollection.findOne(query);
      res.send(result);
    });

    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await fruitsCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const update = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDB = {
        $set: {
          quantity: update.quantity,
          delivered: update.delivered,
        },
      };
      const result = await fruitsCollection.updateOne(
        filter,
        updateDB,
        options
      );
      res.send(result);
    });
  } finally {
  }
};

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running.");
});

app.listen(port, () => {
  console.log("running from port ", port);
});

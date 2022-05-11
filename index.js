const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const res = require("express/lib/response");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { use } = require("express/lib/application");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = header.split(" ")[1];
  jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Access denied" });
    }
    req.decoded = decoded;
    next();
  });
};

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

    const myItemsCollection = client
      .db("fruitsInventory")
      .collection("myItems");

    //jwt
    app.post("/login", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET_ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    app.get("/fruits", async (req, res) => {
      const query = {};
      const cursor = fruitsCollection.find(query);
      const fruits = await cursor.toArray();
      res.send(fruits);
    });

    app.get("/myitems", verifyToken, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = myItemsCollection.find(query);
        const myItems = await cursor.toArray();
        res.send(myItems);
      } else {
        res.status(403).send({ message: "Access denied" });
      }
    });

    app.post("/inventory", async (req, res) => {
      const newItem = req.body;
      const result = await fruitsCollection.insertOne(newItem);
      res.send({ dataRecieved: true });
    });

    app.post("/myitems", async (req, res) => {
      const newItem = req.body;
      const result = await myItemsCollection.insertOne(newItem);
      res.send({ dataRecieved: "success" });
    });

    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await fruitsCollection.findOne(query);
      res.send(result);
    });
    app.get("/myitems/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await myItemsCollection.findOne(query);
      res.send(result);
    });

    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await fruitsCollection.deleteOne(query);
      res.send(result);
    });

    app.delete("/myitems/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await myItemsCollection.deleteOne(query);
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

    app.put("/myitems/:id", async (req, res) => {
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
      const result = await myItemsCollection.updateOne(
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

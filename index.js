const express = require("express");
const cors = require("cors");
const res = require("express/lib/response");
require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());

const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Server is running.");
});

app.listen(port, () => {
  console.log("running from port ", port);
});

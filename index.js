const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const { usersRouter } = require("./routes/users-routes");
const { stripeRouter } = require("./routes/stripe-routes");
const { ordersRouter } = require("./routes/orders-routes");

const app = express();
app.use(cors({ origin: true }));
const port = 8080;
const url = process.env.DB_URL;

app.use(express.json());

app.use("/api/users", usersRouter);

app.use("/api/stripe", stripeRouter);

app.use("/api/orders", ordersRouter);

app.get("/", (req, res) => res.send("Hello world"));

app.listen(port, () => console.log(`app running on port ${port}`));

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connection successful..."))
  .catch((err) => console.log("MongoDB connection field", err.message));

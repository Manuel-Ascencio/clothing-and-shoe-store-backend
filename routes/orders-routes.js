const express = require("express");
const { getOrders } = require("../controllers/orders-controller");

const router = express.Router();

router.get("/", getOrders);

module.exports = { ordersRouter: router };

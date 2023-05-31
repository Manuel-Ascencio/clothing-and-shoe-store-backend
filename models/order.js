const mongoose = require("mongoose");

const orderScheme = new mongoose.Schema(
  {
    userId: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    products: [],
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("order", orderScheme);

exports.Order = Order;

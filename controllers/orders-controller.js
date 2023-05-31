const { Order } = require("../models/order");

exports.getOrders = async (req, res) => {
  const email = req.query.email;
  try {
    const orders = await Order.find({ email: email });
    res.send(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

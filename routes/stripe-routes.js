const express = require("express");
const {
  createCheckoutSession,
  handleWebhookEvents,
} = require("../controllers/stripe-controllers");

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhookEvents
);

module.exports = { stripeRouter: router };

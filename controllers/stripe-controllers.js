const { Order } = require("../models/order");
const stripeAPI = require("../stripe");

exports.createCheckoutSession = async (req, res) => {
  const domainUrl = process.env.WEB_APP_URL;

  const customer = await stripeAPI.customers.create({
    metadata: {
      userId: req.body.userId,
      email: req.body.email,
      customer_email: req.body.email,
    },
    email: req.body.email,
  });

  const line_items = req.body.selectedProducts.map((product) => {
    return {
      quantity: product.quantity,
      price_data: {
        currency: "usd",
        unit_amount: product.price * 100,
        product_data: {
          name: product.title,
          images: [product.image],
        },
      },
    };
  });

  const session = await stripeAPI.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ["card"],
    shipping_address_collection: { allowed_countries: ["MX", "US"] },
    mode: "payment",
    phone_number_collection: { enabled: true },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "usd" },
          display_name: "Free shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 5 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 1500, currency: "usd" },
          display_name: "Next day air",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 1 },
            maximum: { unit: "business_day", value: 1 },
          },
        },
      },
    ],
    line_items,
    success_url: `${domainUrl}/checkout-success`,
    cancel_url: `${domainUrl}/selected-products`,
  });

  res.send({ url: session.url });
};

const createOrder = async (customer, data, lineItems) => {
  const newOrder = new Order({
    userId: customer.metadata.userId,
    email: customer.email,
    products: lineItems.data,
    subtotal: data.amount_subtotal / 100,
    total: data.amount_total / 100,
    shipping: data.customer_details,
  });

  try {
    const savedOrder = await newOrder.save();
  } catch (err) {
    console.log(err);
  }
};

let endpointSecret;

exports.handleWebhookEvents = (req, res) => {
  const sig = req.headers["stripe-signature"];

  let data;
  let eventType;

  if (endpointSecret) {
    let event;

    try {
      event = stripeAPI.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook Error: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    data = event.data.object;
    eventType = event.type;
  } else {
    data = req.body.data.object;
    eventType = req.body.type;
  }

  if (eventType === "checkout.session.completed") {
    stripeAPI.customers
      .retrieve(data.customer)
      .then(async (customer) => {
        stripeAPI.checkout.sessions.listLineItems(
          data.id,
          {},
          function (err, lineItems) {
            createOrder(customer, data, lineItems);
          }
        );
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  res.send().end();
};

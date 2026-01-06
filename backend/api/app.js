import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import Stripe from "stripe"
import { fileURLToPath } from "url"
import { dirname } from "path"
import dbConnect from "./db.js"
import Order from "./models/Order.js"
import Product from "./models/Product.js"
import Payment from "./models/Payment.js"
import Address from "./models/Address.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Explicitly load .env from parent directory
dotenv.config({ path: path.join(__dirname, "../.env") })
console.log("-> Loaded env from:", path.join(__dirname, "../.env"));
console.log("-> STRIPE_SECRET_KEY present:", !!process.env.STRIPE_SECRET_KEY);

const app = express()
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Allow ALL origins
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
)

// Important: Stripe webhook needs raw body for signature verification
// But we are using bodyParser.json() for other routes.
// We can handle this by using express.json() but excluding it for the webhook if needed.
// However, for this simple migration, we'll keep it simple.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Path to products.json (ONE level up from api folder)
const productsPath = path.join(__dirname, "../products.json")
// const products = JSON.parse(fs.readFileSync(productsPath, "utf-8")) // Legacy file read

// SEED PRODUCTS FUNCTION
const seedProducts = async () => {
  try {
    const productsData = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

    // Upsert: Update if exists, Insert if not
    for (const product of productsData) {
      await Product.findOneAndUpdate(
        { id: product.id },
        product,
        { upsert: true, new: true }
      );
    }
    console.log('Products seeded/updated successfully');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

// const orders = [] // REMOVED: Using MongoDB now

// ================= PRODUCTS =================
app.get("/api/products", async (req, res) => {
  await dbConnect();
  await seedProducts(); // Ensure products exist
  const products = await Product.find({});
  res.json(products)
})

app.get("/api/products/:id", async (req, res) => {
  await dbConnect();
  const product = await Product.findOne({ id: parseInt(req.params.id) });
  if (!product) return res.status(404).json({ error: "Product not found" })
  res.json(product)
})

// ================= CREATE ORDER =================
app.post("/api/create-order", async (req, res) => {
  try {
    const { cartItems, customer } = req.body
    console.log("-> Received create-order request");
    console.log("-> Customer:", customer.email);
    console.log("-> Cart Items:", cartItems.length);
    console.log("-> Received create-order request");
    console.log("-> Customer:", customer.email);
    console.log("-> Cart Items:", cartItems.length);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" })
    }

    const amount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    const orderId = `ORD_${Date.now()}`

    const order = new Order({
      orderId,
      cartItems,
      customer,
      amount,
      status: "PENDING"
    })

    // 1. Save Address
    const address = new Address({
      customerEmail: customer.email,
      name: customer.name,
      ...customer.address
    });

    // 2. Create Payment Record (Pending)
    const payment = new Payment({
      orderId,
      amount,
      status: 'PENDING',
      provider: 'stripe'
    });

    await dbConnect()
    console.log("-> DB Connected");
    await address.save();
    console.log("-> Address saved");
    await payment.save();
    console.log("-> Payment saved");
    await order.save()
    console.log("-> Order saved");

    // ================= MOCK MODE (NO API KEY) =================
    if (!process.env.STRIPE_SECRET_KEY) {
      order.status = "PAID"
      order.paidAt = new Date()
      payment.status = "COMPLETED"

      console.log("-> Mock Mode: Payment execution defaulting to success (No Stripe Key)");
      await order.save()
      await payment.save()

      return res.json({
        success: true,
        message: "Mock payment successful. No Stripe API key configured.",
        orderId,
        amount,
        status: order.status
      })
    }

    // ================= REAL STRIPE CALL =================
    console.log("-> Initiating Stripe Checkout...");
    console.log("-> Stripe Key Exists:", !!process.env.STRIPE_SECRET_KEY);
    console.log("-> Initiating Stripe Checkout...");
    console.log("-> Stripe Key Exists:", !!process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cartItems.map(item => ({
        price_data: {
          currency: "usd", // Adjust as needed
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : []
          },
          unit_amount: Math.round(item.price * 100) // Stripe expects cents
        },
        quantity: item.quantity
      })),
      mode: "payment",
      success_url: `${req.headers.origin || "http://localhost:5173"}/?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || "http://localhost:5173"}/cart`,
      client_reference_id: orderId,
      customer_email: customer.email
    })

    res.json({
      orderId,
      paymentUrl: session.url
    })
  } catch (error) {
    console.error("Stripe Error:", error)
    res.status(500).json({ error: "Payment initiation failed" })
  }
})

// ================= WEBHOOK =================
app.post("/api/stripe-webhook", async (req, res) => {
  const event = req.body

  // In a production app, you should verify the webhook signature:
  // const sig = req.headers['stripe-signature'];
  // let event;
  // try {
  //   event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  // } catch (err) {
  //   return res.status(400).send(`Webhook Error: ${err.message}`);
  // }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const orderId = session.client_reference_id

    await dbConnect()
    const order = await Order.findOne({ orderId })
    const payment = await Payment.findOne({ orderId })

    if (order) {
      order.status = "PAID"
      order.paidAt = new Date()
      await order.save()
      console.log(`Order ${orderId} marked as PAID`)
    }

    if (payment) {
      payment.status = "COMPLETED"
      payment.transactionId = session.id
      await payment.save()
    }
  }

  res.json({ received: true })
})

// ================= HEALTH =================
app.get("/api/health", (req, res) => {
  res.json({ status: "Stripe backend running" })
})

export default app

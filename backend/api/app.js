import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import Stripe from "stripe"
import { fileURLToPath } from "url"
import { dirname } from "path"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

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
const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"))

const orders = []

// ================= PRODUCTS =================
app.get("/api/products", (req, res) => {
  res.json(products)
})

app.get("/api/products/:id", (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id))
  if (!product) return res.status(404).json({ error: "Product not found" })
  res.json(product)
})

// ================= CREATE ORDER =================
app.post("/api/create-order", async (req, res) => {
  try {
    const { cartItems, customer } = req.body

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" })
    }

    const amount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    const orderId = `ORD_${Date.now()}`

    const order = {
      orderId,
      cartItems,
      customer,
      amount,
      status: "PENDING",
      createdAt: new Date()
    }

    orders.push(order)

    // ================= MOCK MODE (NO API KEY) =================
    if (!process.env.STRIPE_SECRET_KEY) {
      order.status = "PAID"
      order.paidAt = new Date()

      return res.json({
        success: true,
        message: "Mock payment successful. No Stripe API key configured.",
        orderId,
        amount,
        status: order.status
      })
    }

    // ================= REAL STRIPE CALL =================
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

    const order = orders.find(o => o.orderId === orderId)
    if (order) {
      order.status = "PAID"
      order.paidAt = new Date()
      console.log(`Order ${orderId} marked as PAID`)
    }
  }

  res.json({ received: true })
})

// ================= HEALTH =================
app.get("/api/health", (req, res) => {
  res.json({ status: "Stripe backend running" })
})

export default app

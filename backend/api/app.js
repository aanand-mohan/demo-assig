import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import axios from "axios"
import { fileURLToPath } from "url"
import { dirname } from "path"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

// Allow ALL origins
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// products.json is OUTSIDE backend folder
const productsPath = path.join(__dirname, "../products.json")
const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"))

const orders = []

app.get("/api/products", (req, res) => {
  res.json(products)
})

app.get("/api/products/:id", (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id))
  if (!product) return res.status(404).json({ error: "Product not found" })
  res.json(product)
})

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

    if (!process.env.SKYDO_API_KEY) {
      return res.json({
        orderId,
        paymentUrl: `https://example.com/mock-payment?orderId=${orderId}`
      })
    }

    const response = await axios.post(
      `${process.env.SKYDO_BASE_URL}/payment-requests`,
      {
        amount,
        currency: "INR",
        reference_id: orderId,
        description: "Ecommerce Order Payment",
        customer_email: customer.email
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SKYDO_API_KEY}`
        }
      }
    )

    res.json({
      orderId,
      paymentUrl: response.data.payment_url
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Payment failed" })
  }
})

app.post("/api/skydo-webhook", (req, res) => {
  const { reference_id, payment_status } = req.body

  const order = orders.find(o => o.orderId === reference_id)

  if (order && payment_status === "SUCCESS") {
    order.status = "PAID"
    order.paidAt = new Date()
  }

  res.sendStatus(200)
})

app.get("/api/health", (req, res) => {
  res.json({ status: "Skydo backend running on Vercel" })
})

export default app

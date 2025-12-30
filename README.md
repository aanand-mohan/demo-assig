# E-commerce Application

A full-stack e-commerce application built with React and Node.js, featuring a shopping cart and Stripe payment integration.

## Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: TailwindCSS
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Payment Processing**: Stripe
- **Data Storage**: In-memory (orders), JSON file (products.json)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Stripe Account (for payment processing)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ecommerce
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with your Stripe keys:

```
STRIPE_SECRET_KEY=sk_test_...
```

Start the backend server:

```bash
npm run dev
# Server runs on http://localhost:3000 (or as configured)
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
# Application runs on http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Fetch all available products |
| GET | `/api/products/:id` | Fetch a specific product by ID |
| POST | `/api/create-order` | Create a new order and initiate Stripe session |
| POST | `/api/stripe-webhook` | Handle Stripe webhook events (payment success) |

## Payment Flow

1. User adds items to the cart.
2. Proceeds to checkout and enters details.
3. **Mock Mode**: If no Stripe key is configured, payment succeeds immediately for testing.
4. **Stripe Mode**: User is redirected to Stripe Checkout. Upon success, they are redirected back to the app with a confirmation message.

## Deployment

The project is configured for deployment on Vercel.
- `frontend/vercel.json`: Handles client-side routing rewrites.
- `backend/vercel.json`: Handles serverless function configuration for the API.

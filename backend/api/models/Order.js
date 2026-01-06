import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: {
            line1: String,
            city: String,
            postal_code: String
        }
    },
    cartItems: [
        {
            id: Number,
            name: String,
            price: Number,
            quantity: Number,
            image: String
        }
    ],
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED'],
        default: 'PENDING'
    },
    paidAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Check if model already exists to prevent overwrite error in hot reload
export default mongoose.models.Order || mongoose.model('Order', OrderSchema, 'orders');


import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Keeping ID as number to match frontend logic
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String }, // URL
    icon: { type: String }, // Emoji or Icon class
    category: { type: String },
    stock: { type: Number, default: 100 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);

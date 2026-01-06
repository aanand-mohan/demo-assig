import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
    customerEmail: { type: String, required: true },
    name: { type: String, required: true },
    line1: { type: String, required: true },
    city: { type: String, required: true },
    postal_code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Address || mongoose.model('Address', AddressSchema);

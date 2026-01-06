import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Product from './api/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Explicitly load .env from parent directory if needed, or current
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found');
    process.exit(1);
}

const seed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to DB');

        const productsPath = path.join(__dirname, 'products.json');
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

        console.log(`📦 Found ${productsData.length} products to sync.`);

        for (const product of productsData) {
            const res = await Product.findOneAndUpdate(
                { id: product.id },
                product,
                { upsert: true, new: true }
            );
            console.log(`   - Updated/Inserted: ${res.name} (Icon: ${res.icon})`);
        }

        console.log('✅ Seeding complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seed();

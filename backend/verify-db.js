import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env');
  process.exit(1);
}

console.log('🔄 Attempting to connect to MongoDB...');
console.log(
  '🔐 URI:',
  MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
);

async function checkDb() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');

    const db = mongoose.connection.db;
    console.log(`📂 Database Name: ${db.databaseName}`);

    const collections = await db.listCollections().toArray();

    console.log('📚 Collections found:');
    if (collections.length === 0) {
      console.log('   (No collections yet)');
    } else {
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`   - ${col.name}: ${count} documents`);
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

checkDb();


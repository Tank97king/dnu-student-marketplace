const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace');
  console.log('Connected to DB.');

  try {
    const products = await Product.find().populate('userId', 'name email');
    console.log(`=== ALL PRODUCTS IN DB (${products.length}) ===`);
    for (const p of products) {
      console.log(`Product: ${p.title} (ID: ${p._id})`);
      console.log(`- status: ${p.status}`);
      console.log(`- isApproved: ${p.isApproved}`);
      console.log(`- price: ${p.price}`);
      console.log(`- owner: ${p.userId ? p.userId.email : 'null'}`);
      console.log('------------------------------');
    }
  } catch (error) {
    console.error('Error:', error);
  }

  await mongoose.disconnect();
}

run().catch(console.error);

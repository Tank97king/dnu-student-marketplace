const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Payment = require('./models/Payment');
const Order = require('./models/Order');
const Product = require('./models/Product');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace');
  console.log('Connected to DB.');

  try {
    const payments = await Payment.find({ status: 'pending' })
      .populate({
        path: 'orderId',
        select: 'finalPrice status sellerId',
        populate: {
          path: 'productId',
          select: 'title images'
        }
      });
      
    console.log(`Query results:`);
    for (const p of payments) {
      console.log(`Payment: ${p._id}`);
      console.log(`- Amount: ${p.amount}`);
      console.log(`- Order:`, p.orderId);
      if (p.orderId) {
        console.log(`  - Product:`, p.orderId.productId);
      }
    }
  } catch (error) {
    console.error('Error during query:', error);
  }

  await mongoose.disconnect();
}

run().catch(console.error);

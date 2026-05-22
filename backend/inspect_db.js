const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./models/Product');
const Order = require('./models/Order');
const User = require('./models/User');
const Payment = require('./models/Payment');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace');
  console.log('Connected to DB.');

  try {
    const payments = await Payment.find()
      .populate({
        path: 'orderId',
        populate: {
          path: 'productId'
        }
      });
      
    console.log(`=== ALL PAYMENTS IN DB ===`);
    for (const p of payments) {
      console.log(`Payment ID: ${p._id}`);
      console.log(`- status: ${p.status}`);
      console.log(`- amount: ${p.amount}`);
      console.log(`- transactionCode: ${p.transactionCode}`);
      console.log(`- buyerName: ${p.buyerName}`);
      console.log(`- sellerApproved: ${p.sellerApproved}`);
      console.log(`- adminApproved: ${p.adminApproved}`);
      console.log(`- orderId: ${p.orderId ? p.orderId._id : 'null'}`);
      if (p.orderId) {
        console.log(`  * Order Status: ${p.orderId.status}`);
        console.log(`  * Order FinalPrice: ${p.orderId.finalPrice}`);
        console.log(`  * Product: ${p.orderId.productId ? p.orderId.productId.title : 'null'} (ID: ${p.orderId.productId ? p.orderId.productId._id : 'null'})`);
        if (p.orderId.productId) {
          console.log(`    - Product Status: ${p.orderId.productId.status}`);
          console.log(`    - Product isApproved: ${p.orderId.productId.isApproved}`);
        }
      }
      console.log('------------------------------');
    }

  } catch (error) {
    console.error('Error:', error);
  }

  await mongoose.disconnect();
}

run().catch(console.error);

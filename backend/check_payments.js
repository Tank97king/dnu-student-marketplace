const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Offer = require('./models/Offer');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Payment = require('./models/Payment');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace');
  console.log('Connected to DB.');

  const payments = await Payment.find({}).populate({
    path: 'orderId',
    populate: { path: 'productId' }
  });

  console.log(`Found ${payments.length} payments:`);
  for (const p of payments) {
    console.log({
      id: p._id,
      transactionCode: p.transactionCode,
      buyerName: p.buyerName,
      amount: p.amount,
      status: p.status,
      sellerApproved: p.sellerApproved,
      adminApproved: p.adminApproved,
      paymentProof: p.paymentProof ? 'Yes' : 'No',
      orderStatus: p.orderId ? p.orderId.status : 'No Order'
    });
  }

  await mongoose.disconnect();
}

run().catch(console.error);

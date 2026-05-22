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
    const payments = await Payment.find({ status: 'pending' })
      .populate({
        path: 'orderId',
        select: 'finalPrice status',
        populate: {
          path: 'productId',
          select: 'title images'
        }
      })
      .populate('buyerId', 'name avatar email phone')
      .sort({ createdAt: -1 });

    console.log(`Found ${payments.length} pending payments:`);
    for (const p of payments) {
      console.log(JSON.stringify(p, null, 2));
    }
  } catch (error) {
    console.error('Error during populate/find:', error);
  }

  await mongoose.disconnect();
}

run().catch(console.error);

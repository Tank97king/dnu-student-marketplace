const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace');
  console.log('Connected to DB.');

  try {
    const orders = await Order.find()
      .populate('productId', 'title')
      .populate('buyerId', 'name')
      .populate('sellerId', 'name')
      .populate('shipperId', 'name');

    console.log(`=== ALL ORDERS IN DB (${orders.length}) ===`);
    for (const o of orders) {
      console.log({
        id: o._id,
        product: o.productId ? o.productId.title : 'N/A',
        buyer: o.buyerId ? o.buyerId.name : 'N/A',
        seller: o.sellerId ? o.sellerId.name : 'N/A',
        status: o.status,
        deliveryMethod: o.deliveryMethod,
        paymentMethod: o.paymentMethod,
        shipper: o.shipperId ? o.shipperId.name : 'Chưa gán',
        assignedAt: o.shipperAssignedAt
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }

  await mongoose.disconnect();
}

run().catch(console.error);

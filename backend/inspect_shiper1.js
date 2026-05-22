const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace');
  console.log('Connected to DB.');

  try {
    const user = await User.findOne({ name: /Shiper/i });
    if (user) {
      console.log('=== SHIPPER USER IN DB ===');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('isShipper:', user.isShipper);
      console.log('shipperStatus:', user.shipperStatus);
      console.log('shipperInfo:', user.shipperInfo);
    } else {
      console.log('No user containing "Shiper" in their name was found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }

  await mongoose.disconnect();
}

run().catch(console.error);

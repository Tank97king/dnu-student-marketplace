const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config({ path: './env.example' });

async function testAdminAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if there are any products with isApproved: false
    const pendingProducts = await Product.find({ 
      isApproved: false, 
      status: 'Available' 
    }).populate('userId', 'name email');

    console.log('\n=== PENDING PRODUCTS ===');
    console.log(`Found ${pendingProducts.length} pending products:`);
    
    pendingProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title}`);
      console.log(`   Price: ${product.price} VNĐ`);
      console.log(`   Category: ${product.category}`);
      console.log(`   User: ${product.userId?.name} (${product.userId?.email})`);
      console.log(`   Created: ${product.createdAt}`);
      console.log(`   isApproved: ${product.isApproved}`);
      console.log(`   status: ${product.status}`);
    });

    // Check all products
    const allProducts = await Product.find().populate('userId', 'name email');
    console.log('\n=== ALL PRODUCTS ===');
    console.log(`Total products: ${allProducts.length}`);
    
    allProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title}`);
      console.log(`   isApproved: ${product.isApproved}`);
      console.log(`   status: ${product.status}`);
      console.log(`   Created: ${product.createdAt}`);
    });

    // Check users
    const users = await User.find().select('-password');
    console.log('\n=== USERS ===');
    console.log(`Total users: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name} (${user.email})`);
      console.log(`   isAdmin: ${user.isAdmin}`);
      console.log(`   isActive: ${user.isActive}`);
      console.log(`   isVerified: ${user.isVerified}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testAdminAPI();



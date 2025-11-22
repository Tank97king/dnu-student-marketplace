const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const setSuperAdmin = async () => {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node setSuperAdmin.js <email>');
      console.log('Example: node setSuperAdmin.js 1671020292@dnu.edu.vn');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace');
    
    console.log('MongoDB connected successfully');

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found!');
      process.exit(0);
    }

    console.log('Found user:', user.name);
    console.log('Current status:');
    console.log('  - isAdmin:', user.isAdmin);
    console.log('  - isSuperAdmin:', user.isSuperAdmin);

    // Set as super admin
    user.isAdmin = true;
    user.isSuperAdmin = true;
    user.isVerified = true;
    user.isActive = true;
    await user.save();

    console.log('\n✅ User set as Super Admin successfully!');
    console.log('Updated status:');
    console.log('  - isAdmin: true');
    console.log('  - isSuperAdmin: true');
    console.log('  - isVerified: true');
    console.log('  - isActive: true');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

setSuperAdmin();


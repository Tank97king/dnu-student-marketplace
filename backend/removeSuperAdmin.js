const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const removeSuperAdmin = async () => {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node removeSuperAdmin.js <email>');
      console.log('Example: node removeSuperAdmin.js 1671020292@dnu.edu.vn');
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

    // Remove super admin status
    user.isSuperAdmin = false;
    // Keep isAdmin as false (or you can set it to false if you want to remove admin completely)
    // user.isAdmin = false; // Uncomment if you want to remove admin role completely
    await user.save();

    console.log('\n✅ Super Admin status removed successfully!');
    console.log('Updated status:');
    console.log('  - isAdmin:', user.isAdmin);
    console.log('  - isSuperAdmin: false');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

removeSuperAdmin();


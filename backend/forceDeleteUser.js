const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const forceDeleteUser = async () => {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node forceDeleteUser.js <email>');
      console.log('Example: node forceDeleteUser.js 1671020098@dnu.edu.vn');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace');
    
    console.log('MongoDB connected successfully');
    console.log(`\nForce deleting user with email: ${email}\n`);

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found!');
      process.exit(0);
    }

    console.log('Found user:');
    console.log('  ID:', user._id);
    console.log('  Name:', user.name);
    console.log('  Email:', user.email);
    console.log('  Phone:', user.phone);
    console.log('\nDeleting...');

    // Delete user
    const result = await User.deleteOne({ _id: user._id });
    
    if (result.deletedCount > 0) {
      console.log('✅ User deleted successfully!');
      
      // Verify
      const verify = await User.findOne({ email });
      if (!verify) {
        console.log('✅ Verified: User no longer exists in database');
      } else {
        console.log('⚠️  Warning: User still exists after deletion!');
      }
    } else {
      console.log('❌ Failed to delete user');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 11000) {
      console.error('\n⚠️  Duplicate key error - This might be a unique index issue.');
      console.error('You may need to manually remove the index from MongoDB.');
    }
    process.exit(1);
  }
};

forceDeleteUser();


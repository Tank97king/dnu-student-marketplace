const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const fixDoubleHashedPasswords = async () => {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node fixDoubleHashedPasswords.js <email>');
      console.log('Example: node fixDoubleHashedPasswords.js 1671020292@dnu.edu.vn');
      console.log('\nOr fix all users: node fixDoubleHashedPasswords.js --all');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace');
    
    console.log('MongoDB connected successfully');
    console.log('\n⚠️  WARNING: This script will reset passwords!');
    console.log('Make sure you know the correct password for the user.\n');

    if (email === '--all') {
      console.log('Fixing all users...\n');
      const users = await User.find().select('+password');
      
      for (const user of users) {
        console.log(`Processing user: ${user.email}`);
        // Set a temporary password that will be hashed correctly
        user.password = 'temp123456';
        await user.save();
        console.log(`  ✅ Fixed password for ${user.email}`);
        console.log(`  New password: temp123456 (user should reset it)`);
      }
      
      console.log(`\n✅ Fixed ${users.length} users`);
      console.log('All users now have password: temp123456');
      console.log('Users should reset their passwords after login.');
    } else {
      console.log(`Fixing password for user: ${email}\n`);

      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        console.log('❌ User not found!');
        process.exit(0);
      }

      console.log('Found user:', user.name);
      console.log('Current password hash length:', user.password?.length || 0);
      
      // Reset password - will be hashed correctly by pre-save hook
      user.password = '123456789';
      await user.save();

      console.log('✅ Password fixed!');
      console.log('New password: 123456789');
      console.log('User should change password after login.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

fixDoubleHashedPasswords();


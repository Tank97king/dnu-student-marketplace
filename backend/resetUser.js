const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const resetUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB connected successfully');

    // Find and update user
    const user = await User.findOne({ email: '1671020292@dnu.edu.vn' });
    
    if (!user) {
      console.log('❌ User not found!');
      process.exit(0);
    }

    // Update user - password will be hashed automatically by pre-save hook
    user.password = '123456789';
    user.isVerified = true;
    user.isActive = true;
    await user.save();

    console.log('✅ Password reset successfully!');
    console.log('Email:', user.email);
    console.log('Password: 123456789');
    console.log('Name:', user.name);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

resetUser();


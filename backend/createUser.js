const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const createUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace');
    
    console.log('MongoDB connected successfully');

    // Check if user already exists
    const existingUser = await User.findOne({ email: '1671020292@dnu.edu.vn' });
    
    if (existingUser) {
      console.log('User already exists!');
      console.log('Email:', existingUser.email);
      console.log('Name:', existingUser.name);
      process.exit(0);
    }

    // Create user - password will be hashed automatically by pre-save hook
    // DO NOT hash manually, otherwise it will be hashed twice!
    const user = await User.create({
      name: 'Đinh Thế Thành',
      email: '1671020292@dnu.edu.vn',
      phone: '0367670917',
      password: '123456789', // Will be hashed by pre-save hook
      studentId: '1671020292',
      address: 'phố xốm',
      isVerified: true, // Bypass email verification
      isActive: true,
      isAdmin: true,
      isSuperAdmin: true // Super admin - chỉ super admin mới có thể bổ nhiệm/xóa admin
    });

    console.log('✅ User created successfully!');
    console.log('Email:', user.email);
    console.log('Password: 123456789');
    console.log('Name:', user.name);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createUser();


const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const bcryptjs = require('bcryptjs');

const createUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB connected successfully');

    // Check if user already exists
    const existingUser = await User.findOne({ email: '1671020292@dnu.edu.vn' });
    
    if (existingUser) {
      console.log('User already exists!');
      console.log('Email:', existingUser.email);
      console.log('Name:', existingUser.name);
      process.exit(0);
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('123456789', salt);

    // Create user
    const user = await User.create({
      name: 'Đinh Thế Thành',
      email: '1671020292@dnu.edu.vn',
      phone: '0367670917',
      password: hashedPassword,
      studentId: '1671020292',
      address: 'phố xốm',
      isVerified: true, // Bypass email verification
      isActive: true
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


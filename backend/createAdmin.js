const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace');
    
    console.log('MongoDB connected successfully');

    // Check if admin already exists
    const adminEmail = 'admin@dnu.edu.vn';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      // Update existing user to admin
      existingAdmin.isAdmin = true;
      existingAdmin.isVerified = true;
      existingAdmin.isActive = true;
      existingAdmin.password = 'admin123456';
      await existingAdmin.save();
      
      console.log('✅ Admin updated successfully!');
      console.log('Email:', existingAdmin.email);
      console.log('Password: admin123456');
      console.log('Name:', existingAdmin.name);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin DNU',
      email: adminEmail,
      phone: '0123456789',
      password: 'admin123456',
      studentId: '0000000000',
      address: 'Đại học Đại Nam',
      isAdmin: true,
      isVerified: true,
      isActive: true
    });

    console.log('✅ Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: admin123456');
    console.log('Name:', admin.name);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();





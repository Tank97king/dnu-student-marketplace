const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const checkUserExists = async () => {
  try {
    const email = process.argv[2] || '1671020098@dnu.edu.vn';
    const phone = process.argv[3] || '0367670917';

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace');
    
    console.log('MongoDB connected successfully');
    console.log(`\nChecking for user with email: ${email} or phone: ${phone}\n`);

    // Check by email
    const userByEmail = await User.findOne({ email });
    if (userByEmail) {
      console.log('❌ User found by EMAIL:');
      console.log('  ID:', userByEmail._id);
      console.log('  Name:', userByEmail.name);
      console.log('  Email:', userByEmail.email);
      console.log('  Phone:', userByEmail.phone);
      console.log('  isActive:', userByEmail.isActive);
      console.log('  isAdmin:', userByEmail.isAdmin);
      console.log('  isSuperAdmin:', userByEmail.isSuperAdmin || false);
      console.log('  Created:', userByEmail.createdAt);
    } else {
      console.log('✅ No user found by EMAIL');
    }

    console.log('');

    // Check by phone
    const userByPhone = await User.findOne({ phone });
    if (userByPhone) {
      console.log('❌ User found by PHONE:');
      console.log('  ID:', userByPhone._id);
      console.log('  Name:', userByPhone.name);
      console.log('  Email:', userByPhone.email);
      console.log('  Phone:', userByPhone.phone);
      console.log('  isActive:', userByPhone.isActive);
      console.log('  isAdmin:', userByPhone.isAdmin);
      console.log('  isSuperAdmin:', userByPhone.isSuperAdmin || false);
      console.log('  Created:', userByPhone.createdAt);
    } else {
      console.log('✅ No user found by PHONE');
    }

    console.log('\n---\n');

    // Check all users with similar email/phone
    const allUsers = await User.find({
      $or: [
        { email: { $regex: email.split('@')[0], $options: 'i' } },
        { phone: phone }
      ]
    }).select('name email phone isActive createdAt');

    if (allUsers.length > 0) {
      console.log(`Found ${allUsers.length} user(s) with similar data:`);
      allUsers.forEach((u, i) => {
        console.log(`\n${i + 1}. ${u.name}`);
        console.log(`   Email: ${u.email}`);
        console.log(`   Phone: ${u.phone}`);
        console.log(`   Active: ${u.isActive}`);
        console.log(`   Created: ${u.createdAt}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkUserExists();


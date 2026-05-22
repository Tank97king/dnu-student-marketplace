const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedShippers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace');
    console.log('Da ket noi MongoDB');

    for (let i = 1; i <= 5; i++) {
      const email = `shiper${i}@dnu.edu.vn`;
      const phone = `099988877${i}`;
      
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        console.log(`Tai khoan shiper${i} da ton tai, bo qua...`);
        continue;
      }

      const newShipper = new User({
        name: `Shiper ${i}`,
        email,
        phone,
        password: '123456',
        isVerified: true,
        isShipper: true,
        shipperStatus: 'approved',
        shipperInfo: {
          idCard: `01234567890${i}`,
          vehicleType: 'motorbike',
          operatingArea: 'Khu vuc Truong',
          bio: 'Shipper chuyên nghiệp',
          appliedAt: new Date()
        }
      });
      
      // Middleware 'pre' save se tu dong hash password '123456'
      await newShipper.save();
      console.log(`Tao thanh cong shiper${i} (Email: ${email} | Phone: ${phone} | Pass: 123456)`);
    }

    console.log('Hoan thanh tao 5 tai khoan shipper!');
    process.exit(0);
  } catch (error) {
    console.error('Loi khi tao shiper:', error);
    process.exit(1);
  }
};

seedShippers();

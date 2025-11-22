require('dotenv').config({ path: './.env' });

console.log('===================================');
console.log('  KIỂM TRA CẤU HÌNH EMAIL');
console.log('===================================\n');

const checks = {
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD
};

let allConfigured = true;

console.log('Các biến môi trường:');
console.log('-------------------');

Object.entries(checks).forEach(([key, value]) => {
  if (value) {
    // Mask password
    if (key === 'EMAIL_PASSWORD') {
      const masked = value.length > 4 
        ? value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2)
        : '****';
      console.log(`✅ ${key}: ${masked}`);
    } else {
      console.log(`✅ ${key}: ${value}`);
    }
  } else {
    console.log(`❌ ${key}: CHƯA ĐƯỢC CẤU HÌNH`);
    allConfigured = false;
  }
});

console.log('\n===================================');

if (allConfigured) {
  console.log('✅ TẤT CẢ ĐÃ ĐƯỢC CẤU HÌNH');
  console.log('\nKiểm tra kết nối email...\n');
  
  // Test email connection
  const nodemailer = require('nodemailer');
  
  const isOutlook = checks.EMAIL_HOST && (
    checks.EMAIL_HOST.includes('outlook') || 
    checks.EMAIL_HOST.includes('hotmail') ||
    checks.EMAIL_HOST.includes('live') ||
    checks.EMAIL_HOST.includes('office365')
  );

  const transporter = nodemailer.createTransport({
    host: checks.EMAIL_HOST,
    port: parseInt(checks.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: checks.EMAIL_USER,
      pass: checks.EMAIL_PASSWORD
    },
    ...(isOutlook && {
      tls: {
        ciphers: 'SSLv3'
      }
    })
  });

  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ LỖI KẾT NỐI EMAIL:');
      console.error('  ', error.message);
      console.log('\n📋 Các nguyên nhân có thể:');
      console.log('  1. Email hoặc mật khẩu không đúng');
      console.log('  2. Cần sử dụng App Password (nếu bật 2FA)');
      console.log('  3. Chưa bật "Less secure app access" (Gmail)');
      console.log('  4. Firewall chặn port', checks.EMAIL_PORT || 587);
      console.log('  5. SMTP server không đúng');
    } else {
      console.log('✅ KẾT NỐI EMAIL THÀNH CÔNG!');
      console.log('   Server:', checks.EMAIL_HOST);
      console.log('   Port:', checks.EMAIL_PORT || 587);
      console.log('   User:', checks.EMAIL_USER);
    }
    process.exit(0);
  });
} else {
  console.log('❌ THIẾU CẤU HÌNH');
  console.log('\n📋 Hướng dẫn:');
  console.log('1. Mở file backend/.env');
  console.log('2. Thêm các dòng sau:');
  console.log('');
  console.log('   EMAIL_HOST=smtp-mail.outlook.com');
  console.log('   EMAIL_PORT=587');
  console.log('   EMAIL_USER=your-email@outlook.com');
  console.log('   EMAIL_PASSWORD=your-password');
  console.log('');
  console.log('3. Lưu file và chạy lại script này');
  process.exit(1);
}


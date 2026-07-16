const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace';
        await mongoose.connect(uri);
        console.log('✅ Đã kết nối MongoDB thành công');
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB:', error.message);
        process.exit(1);
    }
};

const createTestAccounts = async () => {
    try {
        await connectDB();

        console.log('\n🚀 Bắt đầu tạo tài khoản test cho CV/Demo...\n');

        const testAccounts = [
            {
                name: 'Seller Test',
                email: 'seller_test@dnu.edu.vn',
                phone: '0999999901',
                password: '123456',
                studentId: '999999901',
                address: 'Khuôn viên Đại học Đại Nam',
                isVerified: true,
                isActive: true
            },
            {
                name: 'Buyer Test',
                email: 'buyer_test@dnu.edu.vn',
                phone: '0999999902',
                password: '123456',
                studentId: '999999902',
                address: 'Khu ký túc xá Đại học Đại Nam',
                isVerified: true,
                isActive: true
            },
            {
                name: 'Admin Test',
                email: 'admin_test@dnu.edu.vn',
                phone: '0999999903',
                password: '123456',
                studentId: '999999903',
                address: 'Phòng đào tạo Đại học Đại Nam',
                isVerified: true,
                isActive: true,
                isAdmin: true,
                isSuperAdmin: true
            }
        ];

        // Xóa các tài khoản cũ nếu đã tồn tại để tránh trùng lặp
        console.log('🗑️  Xóa các tài khoản trùng email/phone cũ nếu có...');
        await User.deleteMany({
            $or: [
                { email: { $in: testAccounts.map(a => a.email) } },
                { phone: { $in: testAccounts.map(a => a.phone) } }
            ]
        });

        // Tạo tài khoản mới
        console.log('➕ Đang thêm tài khoản mới...');
        for (const account of testAccounts) {
            const user = await User.create(account);
            console.log(`✅ Đã tạo thành công: ${user.name} (${user.email})`);
        }

        console.log('\n✨ ĐÃ HOÀN THÀNH TẠO TÀI KHOẢN TEST CHO DEMO! ✨');
        console.log('----------------------------------------------------');
        console.log('1. Tài khoản Người bán (Seller):');
        console.log('   📧 Email: seller_test@dnu.edu.vn');
        console.log('   🔑 Mật khẩu: 123456');
        console.log('----------------------------------------------------');
        console.log('2. Tài khoản Người mua (Buyer):');
        console.log('   📧 Email: buyer_test@dnu.edu.vn');
        console.log('   🔑 Mật khẩu: 123456');
        console.log('----------------------------------------------------');
        console.log('3. Tài khoản Admin (Quản trị):');
        console.log('   📧 Email: admin_test@dnu.edu.vn');
        console.log('   🔑 Mật khẩu: 123456');
        console.log('----------------------------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi tạo tài khoản:', error.message);
        process.exit(1);
    }
};

createTestAccounts();

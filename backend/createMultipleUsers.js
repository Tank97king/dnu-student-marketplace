const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Danh sách họ và tên tiếng Việt
const ho = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
const tenDem = ['Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Thanh', 'Thành', 'Quốc', 'Anh', 'Hoàng', 'Tuấn', 'Phương', 'Thu', 'Hà', 'Mai'];
const ten = ['An', 'Bình', 'Cường', 'Dũng', 'Hùng', 'Khoa', 'Long', 'Nam', 'Phong', 'Quân', 'Sơn', 'Tài', 'Tuấn', 'Vinh', 'Hải',
    'Linh', 'Nga', 'Hương', 'Trang', 'Hà', 'My', 'Anh', 'Thảo', 'Nhung', 'Lan'];

// Hàm tạo tên ngẫu nhiên
function taoTenNgauNhien() {
    const hoNgauNhien = ho[Math.floor(Math.random() * ho.length)];
    const tenDemNgauNhien = tenDem[Math.floor(Math.random() * tenDem.length)];
    const tenNgauNhien = ten[Math.floor(Math.random() * ten.length)];
    return `${hoNgauNhien} ${tenDemNgauNhien} ${tenNgauNhien}`;
}

// Hàm tạo số điện thoại ngẫu nhiên
function taoSoDienThoai() {
    const dauSo = ['032', '033', '034', '035', '036', '037', '038', '039', '070', '076', '077', '078', '079', '081', '082', '083', '084', '085', '086', '088', '089', '090', '091', '092', '093', '094', '096', '097', '098', '099'];
    const dau = dauSo[Math.floor(Math.random() * dauSo.length)];
    const sau = Math.floor(1000000 + Math.random() * 9000000);
    return `${dau}${sau}`;
}

// Kết nối MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Đã kết nối MongoDB thành công');
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB:', error.message);
        process.exit(1);
    }
};

// Tạo người dùng
const taoNguoiDung = async () => {
    try {
        await connectDB();

        console.log('\n🚀 Bắt đầu tạo 20 người dùng...\n');

        const users = [];
        const usedPhones = new Set();

        for (let i = 1; i <= 20; i++) {
            const email = `1671020${String(i).padStart(3, '0')}@dnu.edu.vn`;
            const name = taoTenNgauNhien();

            // Tạo số điện thoại unique
            let phone;
            do {
                phone = taoSoDienThoai();
            } while (usedPhones.has(phone));
            usedPhones.add(phone);

            const userData = {
                name: name,
                email: email,
                phone: phone,
                password: '123456', // Sẽ được hash tự động bởi pre-save hook
                address: 'Đại học Đại Nam',
                studentId: `1671020${String(i).padStart(3, '0')}`,
                isVerified: true, // Đã xác minh
                isActive: true
            };

            users.push(userData);
        }

        // Xóa người dùng cũ nếu có (để tránh lỗi duplicate)
        console.log('🗑️  Xóa người dùng cũ nếu có...');
        await User.deleteMany({
            email: { $in: users.map(u => u.email) }
        });

        // Tạo người dùng mới
        console.log('➕ Tạo người dùng mới...\n');
        const createdUsers = [];

        for (const userData of users) {
            const user = await User.create(userData);
            createdUsers.push(user);
        }

        console.log('✅ Đã tạo thành công', createdUsers.length, 'người dùng:\n');

        createdUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   📱 Phone: ${user.phone}`);
            console.log(`   🔑 Password: 123456`);
            console.log(`   🎓 Student ID: ${user.studentId}`);
            console.log('');
        });

        console.log('✨ Hoàn thành!\n');
        console.log('📝 Thông tin đăng nhập:');
        console.log('   Email: 1671020001@dnu.edu.vn đến 1671020020@dnu.edu.vn');
        console.log('   Mật khẩu: 123456 (tất cả tài khoản)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        if (error.code === 11000) {
            console.error('⚠️  Một số email hoặc số điện thoại đã tồn tại trong database');
        }
        process.exit(1);
    }
};

// Chạy script
taoNguoiDung();

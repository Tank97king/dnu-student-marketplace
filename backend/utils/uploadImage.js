const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB per image - tối ưu cho web
    files: 5 // Tối đa 5 ảnh
  },
  fileFilter: (req, file, cb) => {
    // Chỉ cho phép các format ảnh phổ biến và tối ưu
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload ảnh định dạng JPG, PNG hoặc WebP'));
    }
  }
});

// Upload to Cloudinary với compression và resize tối ưu
const uploadToCloudinary = (buffer, folder = 'dnu-marketplace') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        // Tối ưu ảnh khi upload - giới hạn kích thước và compress
        transformation: [
          {
            width: 1920,
            height: 1920,
            crop: 'limit', // Giới hạn max size, không crop
            quality: 'auto:good', // Tự động optimize quality với chất lượng tốt
            fetch_format: 'auto' // Tự động chọn format tốt nhất (WebP nếu hỗ trợ)
          }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

module.exports = { upload, uploadToCloudinary };



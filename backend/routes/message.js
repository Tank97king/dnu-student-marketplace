const express = require('express');
const {
  sendMessage,
  getConversations,
  getMessages
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/messages/');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    console.log('Multer destination:', uploadPath);
    console.log('File info:', file.originalname, file.mimetype);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Multer filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter:', file.originalname, file.mimetype);
    // Allow all file types for now
    cb(null, true);
  }
});

router.use(protect);

// Add logging middleware for POST requests
router.post('/', (req, res, next) => {
  console.log('Before multer - Request files:', req.files);
  console.log('Before multer - Request body:', req.body);
  next();
}, upload.array('files', 5), (req, res, next) => {
  console.log('After multer - Request files:', req.files);
  console.log('After multer - Request body:', req.body);
  next();
}, sendMessage);
router.get('/conversations', getConversations);
router.get('/:conversationId', getMessages);

module.exports = router;




const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Load env vars
dotenv.config(); // Load from .env file (not env.example)

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const messageRoutes = require('./routes/message');
const adminRoutes = require('./routes/admin');
const commentRoutes = require('./routes/comment');
const notificationRoutes = require('./routes/notification');
const reviewRoutes = require('./routes/review');
const offerRoutes = require('./routes/offer');
const orderRoutes = require('./routes/order');
const productViewRoutes = require('./routes/productView');
const bookmarkRoutes = require('./routes/bookmark');
const bankQRRoutes = require('./routes/bankQR');
const paymentRoutes = require('./routes/payment');
const searchRoutes = require('./routes/search');
const productRecommendationRoutes = require('./routes/productRecommendation');
const postRoutes = require('./routes/post');
const storyRoutes = require('./routes/story');
const collectionRoutes = require('./routes/collection');
const hashtagRoutes = require('./routes/hashtag');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded images)
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-room', async (userId) => {
    socket.join(`user-${userId}`);
    socket.userId = userId; // Store userId for disconnect handling
    console.log(`User ${userId} joined their room`);
    
    // Update user online status
    try {
      const User = require('./models/User');
      await User.findByIdAndUpdate(userId, { 
        isOnline: true, 
        lastSeen: new Date() 
      });
      
      // Notify other users in conversations
      socket.broadcast.emit('user-status-change', { userId, isOnline: true });
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    
    // Update user offline status
    try {
      const User = require('./models/User');
      const userId = socket.userId; // We need to store userId when joining
      if (userId) {
        await User.findByIdAndUpdate(userId, { 
          isOnline: false, 
          lastSeen: new Date() 
        });
        
        // Notify other users in conversations
        socket.broadcast.emit('user-status-change', { userId, isOnline: false });
      }
    } catch (error) {
      console.error('Error updating user offline status:', error);
    }
  });
});

// Make io accessible to routes
app.set('io', io);

// Initialize cron jobs for order/offer expiration
try {
  const cron = require('node-cron');
  const { setIO, runExpirationChecks } = require('./cron/orderExpiration');
  const { setIO: setSmartIO, runSmartNotifications } = require('./cron/smartNotifications');

  // Set io instance for cron notifications
  setIO(io);
  setSmartIO(io);

  // Run expiration checks every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Running expiration checks...');
    await runExpirationChecks();
  });

  // Run smart notifications every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('[Cron] Running smart notifications...');
    await runSmartNotifications();
  });

  // Also run on server start
  setTimeout(async () => {
    console.log('[Cron] Running initial expiration check...');
    await runExpirationChecks();
    
    console.log('[Cron] Running initial smart notifications check...');
    await runSmartNotifications();
  }, 10000); // Wait 10 seconds after server start
  
  console.log('[Cron] Cron jobs initialized successfully');
} catch (error) {
  console.warn('[Cron] node-cron not installed. Cron jobs disabled.');
  console.warn('[Cron] To enable: Run "npm install node-cron" in backend directory');
  // Cron jobs will be disabled, but server will still run
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productViewRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api', productRecommendationRoutes); // Must be before /api/products to avoid route conflict
app.use('/api/products', productRoutes);
app.use('/api/bankqr', bankQRRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/hashtags', hashtagRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace')
.then(() => {
  console.log('MongoDB connected successfully');
  
  // Start server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error('\n❌ ERROR: Port', PORT, 'is already in use!');
      console.error('\n📋 Solutions:');
      console.error('   1. Run KILL_PORT_5000.bat to free the port');
      console.error('   2. Close all terminal windows running backend');
      console.error('   3. Check Task Manager for node.exe processes');
      console.error('   4. Or change PORT in backend/.env file\n');
      console.error('Current processes on port', PORT + ':');
      console.error('   Run: netstat -ano | findstr :' + PORT);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

module.exports = { app, io };






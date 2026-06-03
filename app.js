const express = require('express');
const cors = require('cors');
const methodOverride = require('method-override');
const path = require('path');
require('dotenv').config();

// Config
const { port } = require('./config/base.config');
const db = require('./models');

// Routes
const authRoutes = require('./routes/auth.routes');
const bookRoutes = require('./routes/book.routes');
const loanRoutes = require('./routes/loan.routes');
const reportRoutes = require('./routes/report.routes');
const userRoutes = require('./routes/user.routes');
const returnRoutes = require('./routes/return.routes');

const app = express();

// Middleware global
app.use(cors({
  origin:'*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Sistem Informasi Peminjaman Buku API',
    version: '1.0.0',
    status: 'running'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);

app.use('/api/loans', loanRoutes);

app.use('/api/returns', returnRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`⚠️  404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    status: 404, 
    message: 'Endpoint tidak ditemukan' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(' Error:', err);
  
  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      status: 400, 
      message: 'Ukuran file terlalu besar' 
    });
  }
  
  // Multer file filter error
  if (err.message && err.message.includes('Ekstensi file')) {
    return res.status(400).json({ 
      status: 400, 
      message: err.message 
    });
  }

  res.status(err.status || 500).json({ 
    status: err.status || 500, 
    message: err.message || 'Terjadi kesalahan server' 
  });
});

// Start server
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database terhubung: ' + db.sequelize.config.database);
    
    // Sync models
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      console.log('✅ Development mode: Models ready and synced');
    }
    
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📚 API Base: http://localhost:${port}/api`);
      console.log(`🔍 Health: http://localhost:${port}/`);
      console.log(`📦 Uploads: http://localhost:${port}/uploads/books/`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
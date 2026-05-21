const multer = require('multer');
const path = require('path');
const { allowed_extensions, max_file_size } = require('../config/base.config');

// Konfigurasi storage multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/books/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'book-cover-' + uniqueSuffix + ext);
  },
});

// Filter file extension
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (allowed_extensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Ekstensi file tidak diizinkan. Hanya: ${allowed_extensions.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: max_file_size },
});

module.exports = { upload };
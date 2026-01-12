const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

// Directory for storing branding files (logos)
const BRANDING_DIR = path.join(__dirname, '../../uploads/branding');
const COLORS_DIR = path.join(__dirname, '../../uploads/colors');

// Make sure directories exist
if (!fs.existsSync(BRANDING_DIR)) {
  fs.mkdirSync(BRANDING_DIR, { recursive: true });
  logger.info('Created branding upload directory', { directory: BRANDING_DIR });
}

if (!fs.existsSync(COLORS_DIR)) {
  fs.mkdirSync(COLORS_DIR, { recursive: true });
  logger.info('Created colors upload directory', { directory: COLORS_DIR });
}

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|svg|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    logger.debug('Image file validation passed', {
      filename: file.originalname,
      mimetype: file.mimetype
    });
    return cb(null, true);
  } else {
    logger.warn('Image file validation failed', {
      filename: file.originalname,
      mimetype: file.mimetype
    });
    cb(new Error('Only image files (JPEG, PNG, SVG, WebP) are allowed'));
  }
};

// Branding/Logo storage configuration
const brandingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, BRANDING_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const ext = path.extname(file.originalname);
    cb(null, 'logo-' + uniqueSuffix + ext);
  }
});

// Color images storage configuration
const colorStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, COLORS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const ext = path.extname(file.originalname);
    cb(null, 'color-' + uniqueSuffix + ext);
  }
});

// Configure multer instances
const brandingUpload = multer({
  storage: brandingStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: imageFilter
});

const colorUpload = multer({
  storage: colorStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: imageFilter
});

module.exports = {
  brandingUpload,
  colorUpload,
  BRANDING_DIR,
  COLORS_DIR
};

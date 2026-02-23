const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

// Directory for storing hero section media
const HERO_DIR = path.join(__dirname, '../../uploads/hero_section');

// Make sure directory exists
if (!fs.existsSync(HERO_DIR)) {
    fs.mkdirSync(HERO_DIR, { recursive: true });
    logger.info('Created hero upload directory', { directory: HERO_DIR });
}

// File filter for images and videos
const mediaFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|svg|webp/;
    const allowedVideoTypes = /mp4|webm|quicktime/;

    const ext = path.extname(file.originalname).toLowerCase();
    const isImage = allowedImageTypes.test(ext);
    const isVideo = allowedVideoTypes.test(ext);

    const mimeIsImage = allowedImageTypes.test(file.mimetype);
    const mimeIsVideo = allowedVideoTypes.test(file.mimetype);

    if ((isImage && mimeIsImage) || (isVideo && mimeIsVideo)) {
        logger.debug('Media file validation passed', {
            filename: file.originalname,
            mimetype: file.mimetype
        });
        return cb(null, true);
    } else {
        logger.warn('Media file validation failed', {
            filename: file.originalname,
            mimetype: file.mimetype
        });
        cb(new Error('Only images (JPEG, PNG, SVG, WebP) and videos (MP4, WEBM) are allowed'));
    }
};

// Hero media storage configuration
const heroStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, HERO_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
        const ext = path.extname(file.originalname);
        cb(null, 'hero-' + uniqueSuffix + ext);
    }
});

// Configure multer instance
const heroUpload = multer({
    storage: heroStorage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit for videos
    },
    fileFilter: mediaFilter
});

module.exports = {
    heroUpload,
    HERO_DIR
};

const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');
const path = require('path');

/**
 * Supabase Storage Utility
 *
 * Provides centralized file upload/download functionality using Supabase Storage.
 * Replaces local file system and base64 storage with cloud-based, scalable solution.
 *
 * Features:
 * - Product image uploads
 * - Receipt/document uploads
 * - Secure signed URLs
 * - Automatic CDN distribution
 * - Image optimization support
 *
 * @author VcarePOS System
 * @created 2025-11-17
 */

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Storage bucket configuration
 */
const BUCKETS = {
  PRODUCT_IMAGES: 'product-images',
  RECEIPTS: 'receipts',
  DOCUMENTS: 'documents'
};

/**
 * File upload configuration
 */
const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  URL_EXPIRY_SECONDS: 3600 // 1 hour for signed URLs
};

/**
 * Validates file before upload
 *
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} mimeType - File MIME type
 * @param {string} uploadType - Type of upload ('image' or 'document')
 * @returns {Object} Validation result
 */
function validateFile(fileBuffer, mimeType, uploadType = 'image') {
  try {
    // Check file size
    if (fileBuffer.length > UPLOAD_CONFIG.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`
      };
    }

    // Check MIME type
    const allowedTypes = uploadType === 'image'
      ? UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES
      : UPLOAD_CONFIG.ALLOWED_DOCUMENT_TYPES;

    if (!allowedTypes.includes(mimeType)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  } catch (error) {
    logger.error('File validation error', { error: error.message });
    return { valid: false, error: 'File validation failed' };
  }
}

/**
 * Generates unique file path with timestamp
 *
 * @param {string} folder - Folder name
 * @param {string} filename - Original filename
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique file path
 */
function generateFilePath(folder, filename, prefix = '') {
  const timestamp = Date.now();
  const randomSuffix = Math.round(Math.random() * 1E9);
  const extension = path.extname(filename);
  const baseName = path.basename(filename, extension);
  const sanitizedName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');

  const uniqueFilename = prefix
    ? `${prefix}-${sanitizedName}-${timestamp}-${randomSuffix}${extension}`
    : `${sanitizedName}-${timestamp}-${randomSuffix}${extension}`;

  return `${folder}/${uniqueFilename}`;
}

/**
 * Uploads file to Supabase Storage
 *
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Original filename
 * @param {string} mimeType - File MIME type
 * @param {string} bucket - Storage bucket name
 * @param {string} folder - Folder within bucket
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Upload result with URL
 */
async function uploadFile(fileBuffer, filename, mimeType, bucket, folder, options = {}) {
  try {
    logger.info('Starting file upload', {
      filename,
      mimeType,
      bucket,
      folder,
      size: fileBuffer.length
    });

    // Validate file
    const validation = validateFile(
      fileBuffer,
      mimeType,
      options.uploadType || 'image'
    );

    if (!validation.valid) {
      logger.warn('File validation failed', {
        filename,
        error: validation.error
      });
      throw new Error(validation.error);
    }

    // Generate unique file path
    const filePath = generateFilePath(folder, filename, options.prefix);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        cacheControl: options.cacheControl || '3600',
        upsert: options.upsert || false
      });

    if (error) {
      logger.error('Supabase storage upload failed', {
        filename,
        bucket,
        error: error.message
      });
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    logger.info('File uploaded successfully', {
      filename,
      bucket,
      path: filePath,
      url: urlData.publicUrl
    });

    return {
      success: true,
      path: filePath,
      url: urlData.publicUrl,
      bucket,
      size: fileBuffer.length
    };

  } catch (error) {
    logger.error('File upload error', {
      filename,
      bucket,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Uploads product image
 *
 * @param {Buffer} fileBuffer - Image buffer
 * @param {string} filename - Original filename
 * @param {string} mimeType - Image MIME type
 * @param {string} productId - Product ID for folder organization
 * @returns {Promise<Object>} Upload result
 */
async function uploadProductImage(fileBuffer, filename, mimeType, productId) {
  try {
    return await uploadFile(
      fileBuffer,
      filename,
      mimeType,
      BUCKETS.PRODUCT_IMAGES,
      productId || 'general',
      { uploadType: 'image', prefix: 'product' }
    );
  } catch (error) {
    logger.error('Product image upload failed', {
      productId,
      filename,
      error: error.message
    });
    throw new Error(`Failed to upload product image: ${error.message}`);
  }
}

/**
 * Uploads receipt/document
 *
 * @param {Buffer} fileBuffer - Document buffer
 * @param {string} filename - Original filename
 * @param {string} mimeType - Document MIME type
 * @param {string} orderId - Order ID for folder organization
 * @param {string} userId - User ID for access control
 * @returns {Promise<Object>} Upload result
 */
async function uploadReceipt(fileBuffer, filename, mimeType, orderId, userId) {
  try {
    return await uploadFile(
      fileBuffer,
      filename,
      mimeType,
      BUCKETS.RECEIPTS,
      userId || 'general',
      { uploadType: 'document', prefix: `receipt-${orderId}` }
    );
  } catch (error) {
    logger.error('Receipt upload failed', {
      orderId,
      userId,
      filename,
      error: error.message
    });
    throw new Error(`Failed to upload receipt: ${error.message}`);
  }
}

/**
 * Gets signed URL for private file access
 *
 * @param {string} bucket - Storage bucket name
 * @param {string} filePath - File path in bucket
 * @param {number} expiresIn - URL expiry in seconds
 * @returns {Promise<string>} Signed URL
 */
async function getSignedUrl(bucket, filePath, expiresIn = UPLOAD_CONFIG.URL_EXPIRY_SECONDS) {
  try {
    logger.debug('Generating signed URL', { bucket, filePath, expiresIn });

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      logger.error('Failed to generate signed URL', {
        bucket,
        filePath,
        error: error.message
      });
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }

    logger.debug('Signed URL generated', { bucket, filePath });
    return data.signedUrl;

  } catch (error) {
    logger.error('Signed URL generation error', {
      bucket,
      filePath,
      error: error.message
    });
    throw error;
  }
}

/**
 * Deletes file from storage
 *
 * @param {string} bucket - Storage bucket name
 * @param {string} filePath - File path to delete
 * @returns {Promise<Object>} Deletion result
 */
async function deleteFile(bucket, filePath) {
  try {
    logger.info('Deleting file', { bucket, filePath });

    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      logger.error('File deletion failed', {
        bucket,
        filePath,
        error: error.message
      });
      throw new Error(`File deletion failed: ${error.message}`);
    }

    logger.info('File deleted successfully', { bucket, filePath });
    return { success: true, deleted: data };

  } catch (error) {
    logger.error('File deletion error', {
      bucket,
      filePath,
      error: error.message
    });
    throw error;
  }
}

/**
 * Lists files in a folder
 *
 * @param {string} bucket - Storage bucket name
 * @param {string} folder - Folder path
 * @param {Object} options - List options
 * @returns {Promise<Array>} List of files
 */
async function listFiles(bucket, folder, options = {}) {
  try {
    logger.debug('Listing files', { bucket, folder });

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: options.limit || 100,
        offset: options.offset || 0,
        sortBy: options.sortBy || { column: 'created_at', order: 'desc' }
      });

    if (error) {
      logger.error('Failed to list files', {
        bucket,
        folder,
        error: error.message
      });
      throw new Error(`Failed to list files: ${error.message}`);
    }

    logger.debug('Files listed successfully', { bucket, folder, count: data.length });
    return data;

  } catch (error) {
    logger.error('List files error', {
      bucket,
      folder,
      error: error.message
    });
    throw error;
  }
}

/**
 * Converts base64 image to buffer and uploads
 * Helper function for migrating existing base64 images
 *
 * @param {string} base64String - Base64 encoded image
 * @param {string} filename - Filename for the upload
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Upload result
 */
async function uploadBase64Image(base64String, filename, productId) {
  try {
    // Extract MIME type and data from base64 string
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 string format');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    return await uploadProductImage(buffer, filename, mimeType, productId);

  } catch (error) {
    logger.error('Base64 image upload failed', {
      productId,
      filename,
      error: error.message
    });
    throw new Error(`Failed to upload base64 image: ${error.message}`);
  }
}

module.exports = {
  // Main upload functions
  uploadFile,
  uploadProductImage,
  uploadReceipt,

  // URL generation
  getSignedUrl,

  // File management
  deleteFile,
  listFiles,

  // Helper functions
  validateFile,
  generateFilePath,
  uploadBase64Image,

  // Constants
  BUCKETS,
  UPLOAD_CONFIG,

  // Direct client access (use sparingly)
  supabase
};

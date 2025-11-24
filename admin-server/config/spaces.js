const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');

// Configure S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: process.env.SPACES_ENDPOINT,
  region: process.env.SPACES_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SPACES_SECRET_ACCESS_KEY,
  },
});

// Configure multer for memory storage (we'll upload to Spaces directly)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 15 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,application/pdf').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG and PDF allowed.'));
    }
  },
});

/**
 * Upload file to DigitalOcean Spaces
 * @param {Buffer} buffer - File buffer
 * @param {string} key - File path/key in Spaces
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} - URL of uploaded file
 */
async function uploadToSpaces(buffer, key, contentType) {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.SPACES_BUCKET,
      Key: key,
      Body: buffer,
      ACL: 'public-read',
      ContentType: contentType,
    },
  });

  await upload.done();

  // Return CDN URL if configured, otherwise return direct URL
  const cdnEndpoint = process.env.SPACES_CDN_ENDPOINT;
  if (cdnEndpoint) {
    return `${cdnEndpoint}/${key}`;
  }

  return `${process.env.SPACES_ENDPOINT}/${process.env.SPACES_BUCKET}/${key}`;
}

/**
 * Generate thumbnail from image buffer
 * @param {Buffer} buffer - Original image buffer
 * @returns {Promise<Buffer>} - Thumbnail buffer
 */
async function generateThumbnail(buffer) {
  return await sharp(buffer)
    .resize(400, 300, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();
}

/**
 * Calculate MD5 hash of buffer
 * @param {Buffer} buffer - File buffer
 * @returns {string} - MD5 hash
 */
function calculateMD5(buffer) {
  const hash = crypto.createHash('md5');
  hash.update(buffer);
  return hash.digest('hex');
}

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string} - Unique filename
 */
function generateFilename(originalName) {
  const timestamp = Date.now();
  const ext = originalName.substring(originalName.lastIndexOf('.'));
  return `${timestamp}${ext}`;
}

module.exports = {
  s3Client,
  upload,
  uploadToSpaces,
  generateThumbnail,
  calculateMD5,
  generateFilename,
};

const {S3Client} = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  // Initialize multer-s3 storage
  const upload = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: process.env.BUCKET_NAME,
      acl: 'private', // Keep files private
      contentType: (req, file, cb) => {
        // Manually set content type based on file extension
        const extname = path.extname(file.originalname).toLowerCase();
        let mimeType = 'application/octet-stream'; // Default fallback
        
        // Set the mime type based on file extension
        if (extname === '.jpeg' || extname === '.jpg') {
          mimeType = 'image/jpeg';
        } else if (extname === '.png') {
          mimeType = 'image/png';
        } else if (extname === '.gif') {
          mimeType = 'image/gif';
        } else if (extname === '.svg') {
          mimeType = 'image/svg+xml';
        }
        
        cb(null, mimeType); // Set the content type
      },
      key: (req, file, cb) => {
        const fileName = `uploads/${Date.now()}_${file.originalname}`;
        cb(null, fileName);
      }
    })
  });
  
  // Function to generate pre-signed URL (for getting objects from S3)
  const generatePreSignedUrl = async (bucket, key) => {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });
    // Generate the pre-signed URL with a 1-hour expiration time
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  };


  module.exports = {upload, generatePreSignedUrl};
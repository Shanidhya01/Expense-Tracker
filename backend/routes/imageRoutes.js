const express = require('express');
const { upload, uploadImage } = require('../controllers/imageController');
const router = express.Router();

// Route for uploading image
router.post('/upload-image', upload.single('image'), uploadImage);

module.exports = router;

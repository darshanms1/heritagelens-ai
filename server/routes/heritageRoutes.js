const express = require('express');
const multer = require('multer');
const heritageController = require('../controllers/heritageController');

const router = express.Router();

// Configure multer for memory storage with validation
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedMimeTypes.includes((file.mimetype || '').toLowerCase())) {
            cb(null, true);
        } else {
            const error = new Error('Invalid file format. Please upload a valid JPG, PNG, or WebP image.');
            error.status = 400;
            cb(error, false);
        }
    }
});

// Middleware to gracefully catch multer validation errors
const handleUpload = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ 
                    error: true, 
                    message: 'Image file size exceeds the 10MB limit. Please upload a smaller image.' 
                });
            }
            return res.status(err.status || 400).json({ 
                error: true, 
                message: err.message || 'Image upload failed. Please verify the file is a valid image.' 
            });
        }
        next();
    });
};

router.post('/analyze', handleUpload, heritageController.analyzeImage);
router.post('/explain', heritageController.getExplanation);
router.post('/followup', heritageController.followUp);
router.get('/sites', heritageController.getSites);
router.get('/sites/:siteId/monuments', heritageController.getMonumentsBySite);
router.get('/monuments', heritageController.getAllMonuments);

module.exports = router;

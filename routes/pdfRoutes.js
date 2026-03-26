const express = require('express');
const router = express.Router();
const { generatePdf } = require('../controllers/pdfController');
const { protect } = require('../middleware/authMiddleware');

router.get('/generate/:id', protect, generatePdf);

module.exports = router;

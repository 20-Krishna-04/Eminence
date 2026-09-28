const express = require('express');
const router = express.Router();
const multer = require('multer');
const b2bController = require('../controllers/b2bController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  storage: multer.memoryStorage()
});

// Apply rate limiting to protected B2B routes
router.use(apiLimiter);

router.post('/register', protect, b2bController.registerBusiness);
router.post('/contracts', protect, b2bController.requestContract);
router.get('/contracts', protect, b2bController.getContracts);
router.get('/invoices', protect, b2bController.getInvoices);
router.post('/batch-bookings', protect, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'File upload error' });
    }
    next();
  });
}, b2bController.batchBookings);

module.exports = router;

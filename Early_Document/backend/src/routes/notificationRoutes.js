const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const protect = require('../middleware/authMiddleware');

const notificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(notificationLimiter);
router.use(protect);

router.get('/', notificationController.getNotifications);
router.put('/mark-all-read', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;

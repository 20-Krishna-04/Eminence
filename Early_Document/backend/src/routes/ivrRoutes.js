const express = require('express');
const router = express.Router();
const ivrController = require('../controllers/ivrController');
const { contactLimiter } = require('../middleware/rateLimiter');

// Twilio Voice incoming call webhook
router.all('/incoming', contactLimiter, ivrController.handleIncomingCall);

// DTMF menu selection webhook
router.all('/menu', contactLimiter, ivrController.handleMenuSelection);

// IVR status & operational metrics
router.get('/status', ivrController.getIvrStatus);

module.exports = router;

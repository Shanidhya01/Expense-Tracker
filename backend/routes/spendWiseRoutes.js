const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUPITransactions,
  getUPIAnalytics,
  processEmails,
  setupEmailConfig,
  getEmailConfig,
  verifyTransaction,
  getDailySummary
} = require('../controllers/spendWiseController');

// All routes require authentication
router.use(protect);

// UPI Transactions
router.get('/transactions', getUPITransactions);
router.get('/analytics', getUPIAnalytics);
router.get('/summary/daily', getDailySummary);

// Email Processing
router.post('/process-emails', processEmails);

// Email Configuration
router.post('/email-config', setupEmailConfig);
router.get('/email-config', getEmailConfig);

// Transaction Management
router.put('/transactions/:transactionId/verify', verifyTransaction);

module.exports = router;

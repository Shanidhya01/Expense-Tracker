const UPITransaction = require('../models/UPITransaction');
const EmailConfig = require('../models/EmailConfig');
const emailParserService = require('../services/emailParserService');
const notificationService = require('../services/notificationService');

// Get all UPI transactions for a user
const getUPITransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, startDate, endDate } = req.query;
    const userId = req.user.id;

    const filter = { userId };

    // Add category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Add date range filter
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transactions = await UPITransaction.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await UPITransaction.countDocuments(filter);

    res.json({
      success: true,
      data: {
        transactions,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTransactions: total
      }
    });
  } catch (error) {
    console.error('Error fetching UPI transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching UPI transactions',
      error: error.message
    });
  }
};

// Get UPI transaction analytics
const getUPIAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const transactions = await UPITransaction.find({
      userId,
      date: { $gte: startDate }
    });

    // Calculate analytics
    const analytics = {
      totalSpent: 0,
      transactionCount: transactions.length,
      averageTransaction: 0,
      categoryBreakdown: {},
      dailySpending: {},
      topMerchants: {},
      automatedVsManual: {
        automated: 0,
        manual: 0
      }
    };

    transactions.forEach(transaction => {
      analytics.totalSpent += transaction.amount;

      // Category breakdown
      if (!analytics.categoryBreakdown[transaction.category]) {
        analytics.categoryBreakdown[transaction.category] = {
          amount: 0,
          count: 0
        };
      }
      analytics.categoryBreakdown[transaction.category].amount += transaction.amount;
      analytics.categoryBreakdown[transaction.category].count += 1;

      // Daily spending
      const date = transaction.date.toISOString().split('T')[0];
      if (!analytics.dailySpending[date]) {
        analytics.dailySpending[date] = 0;
      }
      analytics.dailySpending[date] += transaction.amount;

      // Top merchants
      if (!analytics.topMerchants[transaction.merchantName]) {
        analytics.topMerchants[transaction.merchantName] = 0;
      }
      analytics.topMerchants[transaction.merchantName] += transaction.amount;

      // Automated vs Manual
      if (transaction.isAutomated) {
        analytics.automatedVsManual.automated += transaction.amount;
      } else {
        analytics.automatedVsManual.manual += transaction.amount;
      }
    });

    analytics.averageTransaction = analytics.totalSpent / analytics.transactionCount || 0;

    // Sort top merchants
    analytics.topMerchants = Object.entries(analytics.topMerchants)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching UPI analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching UPI analytics',
      error: error.message
    });
  }
};

// Manually process emails for UPI transactions
const processEmails = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const transactions = await emailParserService.processEmailsForUser(userId);
    
    res.json({
      success: true,
      message: `Processed ${transactions.length} new transactions`,
      data: transactions
    });
  } catch (error) {
    console.error('Error processing emails:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing emails',
      error: error.message
    });
  }
};

// Setup email configuration
const setupEmailConfig = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, imapConfig, supportedBanks, notificationSettings } = req.body;

    // Validate IMAP config
    if (!imapConfig || !imapConfig.host || !imapConfig.auth) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IMAP configuration'
      });
    }

    const emailConfig = await EmailConfig.findOneAndUpdate(
      { userId },
      {
        email,
        imapConfig,
        supportedBanks: supportedBanks || ['PAYTM', 'PHONEPE', 'GPAY'],
        notificationSettings: notificationSettings || {
          smsEnabled: true,
          dailySummary: true,
          weeklyReport: true,
          spendingAlerts: true
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Email configuration saved successfully',
      data: emailConfig
    });
  } catch (error) {
    console.error('Error setting up email config:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting up email configuration',
      error: error.message
    });
  }
};

// Get email configuration
const getEmailConfig = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const emailConfig = await EmailConfig.findOne({ userId });
    
    if (!emailConfig) {
      return res.json({
        success: true,
        data: null,
        message: 'No email configuration found'
      });
    }

    // Don't send sensitive data
    const safeConfig = {
      email: emailConfig.email,
      isActive: emailConfig.isActive,
      supportedBanks: emailConfig.supportedBanks,
      notificationSettings: emailConfig.notificationSettings,
      lastProcessedDate: emailConfig.lastProcessedDate
    };

    res.json({
      success: true,
      data: safeConfig
    });
  } catch (error) {
    console.error('Error fetching email config:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email configuration',
      error: error.message
    });
  }
};

// Verify a UPI transaction
const verifyTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { verified, category } = req.body;
    const userId = req.user.id;

    const transaction = await UPITransaction.findOneAndUpdate(
      { _id: transactionId, userId },
      { 
        verified,
        ...(category && { category })
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Error verifying transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying transaction',
      error: error.message
    });
  }
};

// Get daily summary
const getDailySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;
    
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const transactions = await UPITransaction.find({
      userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    const summary = notificationService.calculateDailySummary(transactions);
    
    res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        summary,
        transactions
      }
    });
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily summary',
      error: error.message
    });
  }
};

module.exports = {
  getUPITransactions,
  getUPIAnalytics,
  processEmails,
  setupEmailConfig,
  getEmailConfig,
  verifyTransaction,
  getDailySummary
};

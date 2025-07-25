const mongoose = require('mongoose');

const emailConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  imapConfig: {
    host: String,
    port: Number,
    secure: Boolean,
    auth: {
      user: String,
      pass: String // This will be encrypted
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastProcessedDate: {
    type: Date,
    default: Date.now
  },
  supportedBanks: [{
    type: String,
    enum: ['PAYTM', 'PHONEPE', 'GPAY', 'AMAZON', 'FLIPKART', 'SBI', 'HDFC', 'ICICI', 'AXIS']
  }],
  notificationSettings: {
    smsEnabled: {
      type: Boolean,
      default: true
    },
    dailySummary: {
      type: Boolean,
      default: true
    },
    weeklyReport: {
      type: Boolean,
      default: true
    },
    spendingAlerts: {
      type: Boolean,
      default: true
    },
    phone: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailConfig', emailConfigSchema);

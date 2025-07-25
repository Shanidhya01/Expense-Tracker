const mongoose = require('mongoose');

const upiTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  merchantName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Other'],
    default: 'Other'
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Card', 'NetBanking', 'Wallet'],
    default: 'UPI'
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String
  },
  isAutomated: {
    type: Boolean,
    default: true
  },
  rawEmailData: {
    type: String // Store original email content for reference
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8 // AI confidence in categorization
  },
  verified: {
    type: Boolean,
    default: false // User can verify automated entries
  }
}, {
  timestamps: true
});

// Index for efficient queries
upiTransactionSchema.index({ userId: 1, date: -1 });
upiTransactionSchema.index({ transactionId: 1 });

module.exports = mongoose.model('UPITransaction', upiTransactionSchema);

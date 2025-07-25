const twilio = require('twilio');
const UPITransaction = require('../models/UPITransaction');
const EmailConfig = require('../models/EmailConfig');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class NotificationService {
  constructor() {
    this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  // Send daily spending summary
  async sendDailySummary(userId) {
    try {
      const emailConfig = await EmailConfig.findOne({ userId });
      if (!emailConfig || !emailConfig.notificationSettings.dailySummary) {
        return;
      }

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      // Get today's transactions
      const todayTransactions = await UPITransaction.find({
        userId,
        date: {
          $gte: yesterday.setHours(0, 0, 0, 0),
          $lt: today.setHours(23, 59, 59, 999)
        }
      });

      if (todayTransactions.length === 0) {
        return;
      }

      // Calculate summary
      const summary = this.calculateDailySummary(todayTransactions);
      
      // Generate insights using AI
      const insights = await this.generateSpendingInsights(summary, todayTransactions);

      // Send SMS notification
      const message = this.formatDailySummaryMessage(summary, insights);
      
      if (emailConfig.notificationSettings.phone) {
        await this.client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: emailConfig.notificationSettings.phone
        });
      }

      return { summary, insights };
    } catch (error) {
      console.error('Error sending daily summary:', error);
      throw error;
    }
  }

  // Calculate daily spending summary
  calculateDailySummary(transactions) {
    const summary = {
      totalSpent: 0,
      transactionCount: transactions.length,
      categories: {},
      topMerchant: null,
      averageTransaction: 0
    };

    transactions.forEach(transaction => {
      summary.totalSpent += transaction.amount;
      
      if (!summary.categories[transaction.category]) {
        summary.categories[transaction.category] = {
          amount: 0,
          count: 0
        };
      }
      
      summary.categories[transaction.category].amount += transaction.amount;
      summary.categories[transaction.category].count += 1;
    });

    summary.averageTransaction = summary.totalSpent / summary.transactionCount;

    // Find top spending category
    summary.topCategory = Object.keys(summary.categories).reduce((a, b) => 
      summary.categories[a].amount > summary.categories[b].amount ? a : b
    );

    return summary;
  }

  // Generate AI insights for spending
  async generateSpendingInsights(summary, transactions) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `
        Analyze this daily spending data and provide 2-3 brief insights and recommendations:
        
        Total Spent: ₹${summary.totalSpent}
        Transactions: ${summary.transactionCount}
        Top Category: ${summary.topCategory}
        Categories: ${JSON.stringify(summary.categories)}
        
        Provide:
        1. One observation about spending pattern
        2. One actionable tip to save money
        3. One positive reinforcement (if spending is reasonable)
        
        Keep it conversational and under 100 words total.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
      
    } catch (error) {
      console.error('Error generating insights:', error);
      return 'Great job tracking your expenses! Keep monitoring your spending habits.';
    }
  }

  // Format daily summary message
  formatDailySummaryMessage(summary, insights) {
    const categoryList = Object.entries(summary.categories)
      .map(([cat, data]) => `${cat}: ₹${data.amount}`)
      .join(', ');

    return `
🔔 SpendWise Daily Summary

💸 Today's Spending: ₹${summary.totalSpent}
📊 ${summary.transactionCount} transactions
🏆 Top Category: ${summary.topCategory}

📋 Breakdown: ${categoryList}

💡 ${insights}

Track more at your Expense Tracker dashboard!
    `.trim();
  }

  // Send spending alert for high amounts
  async sendSpendingAlert(userId, transaction) {
    try {
      const emailConfig = await EmailConfig.findOne({ userId });
      if (!emailConfig || !emailConfig.notificationSettings.spendingAlerts) {
        return;
      }

      // Alert for transactions above ₹500
      if (transaction.amount > 500 && emailConfig.notificationSettings.phone) {
        const message = `
🚨 SpendWise Alert

Large expense detected:
💰 ₹${transaction.amount} at ${transaction.merchantName}
📂 Category: ${transaction.category}
⏰ ${new Date().toLocaleString()}

Review in your Expense Tracker app.
        `.trim();

        await this.client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: emailConfig.notificationSettings.phone
        });
      }
    } catch (error) {
      console.error('Error sending spending alert:', error);
    }
  }

  // Send weekly spending report
  async sendWeeklyReport(userId) {
    try {
      const emailConfig = await EmailConfig.findOne({ userId });
      if (!emailConfig || !emailConfig.notificationSettings.weeklyReport) {
        return;
      }

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const weeklyTransactions = await UPITransaction.find({
        userId,
        date: { $gte: weekAgo }
      });

      if (weeklyTransactions.length === 0) {
        return;
      }

      const summary = this.calculateWeeklySummary(weeklyTransactions);
      const message = this.formatWeeklyMessage(summary);

      if (emailConfig.notificationSettings.phone) {
        await this.client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: emailConfig.notificationSettings.phone
        });
      }

      return summary;
    } catch (error) {
      console.error('Error sending weekly report:', error);
      throw error;
    }
  }

  calculateWeeklySummary(transactions) {
    const summary = {
      totalSpent: 0,
      dailyAverage: 0,
      categories: {},
      daysActive: new Set()
    };

    transactions.forEach(transaction => {
      summary.totalSpent += transaction.amount;
      summary.daysActive.add(transaction.date.toDateString());
      
      if (!summary.categories[transaction.category]) {
        summary.categories[transaction.category] = 0;
      }
      summary.categories[transaction.category] += transaction.amount;
    });

    summary.dailyAverage = summary.totalSpent / 7;
    summary.activeDays = summary.daysActive.size;

    return summary;
  }

  formatWeeklyMessage(summary) {
    const topCategories = Object.entries(summary.categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([cat, amount]) => `${cat}: ₹${amount}`)
      .join(', ');

    return `
📊 SpendWise Weekly Report

💰 Total Spent: ₹${summary.totalSpent}
📈 Daily Average: ₹${Math.round(summary.dailyAverage)}
📅 Active Days: ${summary.activeDays}/7

🏆 Top Categories: ${topCategories}

Keep tracking with SpendWise! 💪
    `.trim();
  }
}

module.exports = new NotificationService();

const cron = require('node-cron');
const emailParserService = require('./emailParserService');
const notificationService = require('./notificationService');
const EmailConfig = require('../models/EmailConfig');

class AutomationService {
  constructor() {
    this.setupCronJobs();
  }

  setupCronJobs() {
    // Process emails every 2 hours during day time (8 AM to 10 PM)
    cron.schedule('0 */2 8-22 * * *', async () => {
      console.log('🔄 Running automated email processing...');
      await this.processAllUserEmails();
    }, {
      timezone: "Asia/Kolkata"
    });

    // Send daily summary at 9 PM
    cron.schedule('0 21 * * *', async () => {
      console.log('📊 Sending daily summaries...');
      await this.sendDailySummaries();
    }, {
      timezone: "Asia/Kolkata"
    });

    // Send weekly report on Sunday at 10 AM
    cron.schedule('0 10 * * 0', async () => {
      console.log('📈 Sending weekly reports...');
      await this.sendWeeklyReports();
    }, {
      timezone: "Asia/Kolkata"
    });

    console.log('✅ SpendWise automation jobs scheduled');
  }

  // Process emails for all active users
  async processAllUserEmails() {
    try {
      const activeConfigs = await EmailConfig.find({ isActive: true });
      
      console.log(`📧 Processing emails for ${activeConfigs.length} users`);

      for (const config of activeConfigs) {
        try {
          const transactions = await emailParserService.processEmailsForUser(config.userId);
          
          if (transactions.length > 0) {
            console.log(`✅ Processed ${transactions.length} transactions for user ${config.userId}`);
            
            // Send alerts for high-value transactions
            for (const transaction of transactions) {
              await notificationService.sendSpendingAlert(config.userId, transaction);
            }
          }
        } catch (error) {
          console.error(`❌ Error processing emails for user ${config.userId}:`, error.message);
        }
      }
    } catch (error) {
      console.error('❌ Error in processAllUserEmails:', error);
    }
  }

  // Send daily summaries to all users
  async sendDailySummaries() {
    try {
      const activeConfigs = await EmailConfig.find({ 
        isActive: true,
        'notificationSettings.dailySummary': true 
      });

      console.log(`📱 Sending daily summaries to ${activeConfigs.length} users`);

      for (const config of activeConfigs) {
        try {
          await notificationService.sendDailySummary(config.userId);
          console.log(`✅ Daily summary sent to user ${config.userId}`);
        } catch (error) {
          console.error(`❌ Error sending daily summary to user ${config.userId}:`, error.message);
        }
      }
    } catch (error) {
      console.error('❌ Error in sendDailySummaries:', error);
    }
  }

  // Send weekly reports to all users
  async sendWeeklyReports() {
    try {
      const activeConfigs = await EmailConfig.find({ 
        isActive: true,
        'notificationSettings.weeklyReport': true 
      });

      console.log(`📊 Sending weekly reports to ${activeConfigs.length} users`);

      for (const config of activeConfigs) {
        try {
          await notificationService.sendWeeklyReport(config.userId);
          console.log(`✅ Weekly report sent to user ${config.userId}`);
        } catch (error) {
          console.error(`❌ Error sending weekly report to user ${config.userId}:`, error.message);
        }
      }
    } catch (error) {
      console.error('❌ Error in sendWeeklyReports:', error);
    }
  }

  // Manual trigger for testing
  async triggerManualProcess(userId) {
    try {
      console.log(`🔧 Manual trigger for user ${userId}`);
      
      const transactions = await emailParserService.processEmailsForUser(userId);
      const summary = await notificationService.sendDailySummary(userId);
      
      return {
        transactions: transactions.length,
        summary
      };
    } catch (error) {
      console.error('❌ Error in manual trigger:', error);
      throw error;
    }
  }
}

module.exports = new AutomationService();

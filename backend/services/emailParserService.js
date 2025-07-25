const Imap = require('imap');
const { simpleParser } = require('mailparser');
const UPITransaction = require('../models/UPITransaction');
const EmailConfig = require('../models/EmailConfig');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class EmailParserService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  // Parse UPI transaction from email content
  async parseUPITransaction(emailContent, userId) {
    try {
      const transactionData = await this.extractTransactionData(emailContent);
      
      if (transactionData) {
        // Check if transaction already exists
        const existingTransaction = await UPITransaction.findOne({
          transactionId: transactionData.transactionId
        });

        if (!existingTransaction) {
          // Categorize using AI
          const category = await this.categorizeTransaction(transactionData.merchantName, transactionData.description);
          
          const upiTransaction = new UPITransaction({
            userId,
            ...transactionData,
            category,
            rawEmailData: emailContent,
            isAutomated: true
          });

          await upiTransaction.save();
          return upiTransaction;
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing UPI transaction:', error);
      throw error;
    }
  }

  // Extract transaction data from email using regex patterns
  extractTransactionData(emailContent) {
    const patterns = {
      // PayTm patterns
      paytm: {
        amount: /Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        merchant: /(?:paid to|sent to)\s+([^.]+?)(?:\s+on|\s+via|\.|$)/i,
        transactionId: /(?:transaction id|txn id|paytm txn id)[\s:]+([a-zA-Z0-9]+)/i,
        date: /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})/
      },
      // PhonePe patterns
      phonepe: {
        amount: /Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        merchant: /(?:paid|sent)\s+(?:Rs\.?\s*\d+(?:,\d+)*(?:\.\d{2})?\s+)?to\s+([^.]+?)(?:\s+via|\s+on|\.|$)/i,
        transactionId: /(?:utr|ref no|transaction id)[\s:]+([a-zA-Z0-9]+)/i,
        date: /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})/
      },
      // Google Pay patterns
      gpay: {
        amount: /₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)|Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        merchant: /(?:paid|sent)\s+(?:₹|Rs\.?\s*\d+(?:,\d+)*(?:\.\d{2})?\s+)?to\s+([^.]+?)(?:\s+via|\s+using|\.|$)/i,
        transactionId: /(?:google transaction id|transaction id|utr)[\s:]+([a-zA-Z0-9]+)/i,
        date: /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})/
      },
      // Amazon patterns
      amazon: {
        amount: /₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)|Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        merchant: /amazon/i,
        transactionId: /(?:order|transaction)[\s#:]+([a-zA-Z0-9-]+)/i,
        date: /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})/
      }
    };

    // Try each pattern
    for (const [platform, pattern] of Object.entries(patterns)) {
      if (emailContent.toLowerCase().includes(platform) || 
          (platform === 'gpay' && emailContent.toLowerCase().includes('google pay'))) {
        
        const amountMatch = emailContent.match(pattern.amount);
        const merchantMatch = emailContent.match(pattern.merchant);
        const transactionIdMatch = emailContent.match(pattern.transactionId);
        const dateMatch = emailContent.match(pattern.date);

        if (amountMatch && merchantMatch && transactionIdMatch) {
          return {
            amount: parseFloat(amountMatch[1] || amountMatch[2] || '0'.replace(/,/g, '')),
            merchantName: merchantMatch[1].trim(),
            transactionId: transactionIdMatch[1],
            date: dateMatch ? new Date(dateMatch[1]) : new Date(),
            description: `${platform.toUpperCase()} payment`,
            paymentMethod: 'UPI'
          };
        }
      }
    }

    return null;
  }

  // Use Gemini AI to categorize transactions
  async categorizeTransaction(merchantName, description) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `
        Categorize the following transaction into one of these categories: Food, Travel, Shopping, Entertainment, Bills, Healthcare, Education, Other.
        
        Merchant: ${merchantName}
        Description: ${description}
        
        Rules:
        - Food: Restaurants, food delivery, groceries, cafes
        - Travel: Uber, Ola, petrol, metro, bus, flights, hotels
        - Shopping: Amazon, Flipkart, clothing, electronics, general shopping
        - Entertainment: Movies, gaming, subscriptions, events
        - Bills: Electricity, phone, internet, insurance, EMI
        - Healthcare: Medicines, hospitals, clinics, health services
        - Education: Courses, books, tuition, educational services
        - Other: Everything else
        
        Respond with only the category name.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const category = response.text().trim();
      
      // Validate category
      const validCategories = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Other'];
      return validCategories.includes(category) ? category : 'Other';
      
    } catch (error) {
      console.error('Error categorizing transaction:', error);
      return 'Other';
    }
  }

  // Process emails for a user
  async processEmailsForUser(userId) {
    try {
      const emailConfig = await EmailConfig.findOne({ userId, isActive: true });
      if (!emailConfig) {
        throw new Error('Email configuration not found');
      }

      const imap = new Imap(emailConfig.imapConfig);
      
      return new Promise((resolve, reject) => {
        imap.once('ready', () => {
          imap.openBox('INBOX', false, (err, box) => {
            if (err) reject(err);

            // Search for emails from last 24 hours
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const searchCriteria = [
              'UNSEEN',
              ['SINCE', yesterday],
              ['OR', 
                ['FROM', 'paytm'],
                ['FROM', 'phonepe'],
                ['FROM', 'googlepay'],
                ['FROM', 'amazon'],
                ['FROM', 'flipkart']
              ]
            ];

            imap.search(searchCriteria, (err, results) => {
              if (err) reject(err);
              
              if (results.length === 0) {
                imap.end();
                resolve([]);
                return;
              }

              const fetch = imap.fetch(results, { bodies: '' });
              const transactions = [];

              fetch.on('message', (msg) => {
                msg.on('body', (stream) => {
                  simpleParser(stream, async (err, parsed) => {
                    if (!err) {
                      const transaction = await this.parseUPITransaction(
                        parsed.text || parsed.html, 
                        userId
                      );
                      if (transaction) {
                        transactions.push(transaction);
                      }
                    }
                  });
                });
              });

              fetch.once('end', () => {
                imap.end();
                resolve(transactions);
              });
            });
          });
        });

        imap.once('error', reject);
        imap.connect();
      });

    } catch (error) {
      console.error('Error processing emails:', error);
      throw error;
    }
  }
}

module.exports = new EmailParserService();

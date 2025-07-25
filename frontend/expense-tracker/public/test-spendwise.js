// Manual test script for SpendWise AI categorization
// Run this in browser console after logging in

const testSpendWiseAI = async () => {
    console.log('🤖 Testing SpendWise AI Categorization...');
    
    // Sample transactions to test categorization
    const sampleTransactions = [
        { description: 'Paid to Starbucks Coffee', amount: 450 },
        { description: 'Swiggy Food Delivery', amount: 320 },
        { description: 'Uber Ride', amount: 180 },
        { description: 'Amazon Shopping', amount: 2500 },
        { description: 'Netflix Subscription', amount: 649 },
        { description: 'Gym Membership', amount: 2000 },
        { description: 'Medical Store', amount: 850 }
    ];
    
    console.log('📝 Sample transactions for AI categorization:');
    sampleTransactions.forEach((tx, i) => {
        console.log(`${i+1}. ${tx.description} - ₹${tx.amount}`);
    });
    
    console.log('\n🔗 API Test URLs:');
    console.log('• SpendWise Transactions: /api/v1/spendwise/transactions');
    console.log('• Analytics: /api/v1/spendwise/analytics');
    console.log('• Daily Summary: /api/v1/spendwise/summary/daily');
    
    console.log('\n🎯 To test:');
    console.log('1. Add expenses in the expense page');
    console.log('2. Visit SpendWise analytics to see AI categorization');
    console.log('3. Check SMS notifications (scheduled for 9 PM)');
    console.log('4. Configure email processing for UPI transactions');
    
    return sampleTransactions;
};

// Export for browser console usage
window.testSpendWiseAI = testSpendWiseAI;

console.log('🚀 SpendWise Test Script Loaded!');
console.log('Run testSpendWiseAI() in console to see sample data');

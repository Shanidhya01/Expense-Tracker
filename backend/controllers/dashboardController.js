const Expense = require("../models/Expense");
const Income = require("../models/Income");
const {isValidObjectId,Types} = require("mongoose");

// Dashboard Data
exports.getDashboardData = async (req, res) => {
  try{
    const userId = req.user.id;
    const userObjectId =  new Types.ObjectId(String(userId));

    console.log("Dashboard request for userId:", userId);
    console.log("UserObjectId:", userObjectId);

    // Fetch total expenses and incomes
    const totalIncome = await Income.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    console.log("Total Income aggregation result:", totalIncome);

    const totalExpense = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    console.log("Total Expense aggregation result:", totalExpense);

    // Get income transactions in the last 60 days
    const last60DaysIncomeTransactions = await Income.find({
      userId: userObjectId,
      createdAt: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }
    }).sort({date:-1});

    // Get total income in the last 60 days
    const incomeLast60Days = last60DaysIncomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Get expense transactions in the last 60 days (changed from 30 to 60)
    const last60DaysExpenseTransactions = await Expense.find({
      userId: userObjectId,
      createdAt: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }
    }).sort({date:-1});

    // get total expense in the last 60 days
    const expenseLast60Days = last60DaysExpenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // fetch last 5 transactions
    const lastTransactions = [
      ...(await Income.find({ userId: userObjectId }).sort({ date: -1 }).limit(5)).map(
        (txn) => ({
          ...txn.toObject(),
          type: "income"
        })
      ),
      ...(await Expense.find({ userId: userObjectId }).sort({ date: -1 }).limit(5)).map(
        (txn) => ({
          ...txn.toObject(),
          type: "expense"
        })
      ),
    ].sort((a, b) => b.date - a.date);

    console.log("Data summary:", {
      totalIncomeRecords: totalIncome.length,
      totalExpenseRecords: totalExpense.length,
      last60DaysIncomeCount: last60DaysIncomeTransactions.length,
      last60DaysExpenseCount: last60DaysExpenseTransactions.length,
      recentTransactionsCount: lastTransactions.length
    });

    // final response
    res.json({
      totalBalance: 
        (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
      totalIncome: totalIncome[0]?.total || 0,
      totalExpense: totalExpense[0]?.total || 0,
      last60DaysExpense:{
        total:expenseLast60Days,
        transactions:last60DaysExpenseTransactions
      },
      last60DaysIncome: {
        total: incomeLast60Days,
        transactions: last60DaysIncomeTransactions
      },
      recentTransactions: lastTransactions,
    })
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
}
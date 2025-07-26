const xlsx = require('xlsx');
const Expense = require('../models/Expense');

// Add Expense category
exports.addExpense = async (req, res) => {
  const userId = req.user._id;

  try{
    const { icon, category, amount, date } = req.body;

    if (!category || !amount || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newExpense = new Expense({
      userId,
      icon,
      category,
      amount,
      date: new Date(date)
    });
    await newExpense.save();
    res.status(201).json(newExpense);
  }catch (error) {
    res.status(500).json({ message: 'Error adding Expense', error: error.message });
  }
}

// Get all Expenses
exports.getAllExpenses = async (req, res) => {
  const userId = req.user._id;

  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Expenses', error: error.message });
  }
}

// Delete Expense by ID
exports.deleteExpense = async (req, res) => {
  try{
    await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Expense deleted successfully' });
  }catch (error) {
    res.status(500).json({ message: 'Error deleting Expense', error: error.message });
  }
}

// Download Expense data as Excel file
exports.downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 });

    // Prepare data for Excel
    const data = expenses.map((item) => ({
      Category: item.category,
      Amount: item.amount,
      Date: new Date(item.date).toLocaleDateString(),
      Description: item.description || 'N/A',
      PaymentMethod: item.paymentMethod || 'N/A'
    }));

    // Generate Excel file buffer
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, 'Expenses');
    
    // Convert to buffer instead of writing to file
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=expenses_details.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Error downloading Expense data', error: error.message });
  }
}
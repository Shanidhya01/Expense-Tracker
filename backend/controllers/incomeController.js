const xlsx = require('xlsx');
const Income = require('../models/Income');

// Add income Source
exports.addIncome = async (req, res) => {
  const userId = req.user._id;

  try{
    const { icon, source, amount, date } = req.body;

    if (!source || !amount || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newIncome = new Income({
      userId,
      icon,
      source,
      amount,
      date: new Date(date)
    });
    await newIncome.save();
    res.status(201).json(newIncome);
  }catch (error) {
    res.status(500).json({ message: 'Error adding income', error: error.message });
  }
}

// Get all incomes
exports.getAllIncomes = async (req, res) => {
  const userId = req.user._id;

  try {
    const incomes = await Income.find({ userId }).sort({ date: -1 });
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incomes', error: error.message });
  }
}

// Delete income by ID
exports.deleteIncome = async (req, res) => {
  try{
    await Income.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Income deleted successfully' });
  }catch (error) {
    res.status(500).json({ message: 'Error deleting income', error: error.message });
  }
}

// Download income data as Excel file
exports.downloadIncomeExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const incomes = await Income.find({ userId }).sort({ date: -1 });

    // Prepare data for Excel
    const data = incomes.map((item) => ({
      Source: item.source,
      Amount: item.amount,
      Date: new Date(item.date).toLocaleDateString(),
      Category: item.category || 'N/A',
      Description: item.description || 'N/A'
    }));

    // Generate Excel file buffer
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, 'Incomes');
    
    // Convert to buffer instead of writing to file
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=incomes_details.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Error downloading income data', error: error.message });
  }
}
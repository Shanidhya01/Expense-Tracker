// Test script to check database data
const mongoose = require("mongoose");
require("dotenv").config();

const Income = require("./models/Income");
const Expense = require("./models/Expense");
const User = require("./models/User");

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
    
    const users = await User.find({}).select('_id username email');
    console.log("Users in database:", users);
    
    const incomes = await Income.find({});
    console.log("Incomes in database:", incomes.length);
    
    const expenses = await Expense.find({});
    console.log("Expenses in database:", expenses.length);
    
    if (incomes.length > 0) {
      console.log("Sample income:", incomes[0]);
    }
    
    if (expenses.length > 0) {
      console.log("Sample expense:", expenses[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkData();

// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Expense = require('./models/Expenses');

const app = express();
const port = 5001;

app.use(cors());
app.use(bodyParser.json());

// Connect to the MongoDB database
mongoose.connect('mongodb://localhost:27017/expense_tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once('open', () => {
  console.log('Connected to the database');
});

let maxMonthlyExpense = 10000;

// API endpoints
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const newExpense = new Expense(req.body);
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error adding expense' });
  }
});


app.put('/api/expenses/:id', async (req, res) => {
  try {
    const expenseId = req.params.id;
    const updatedExpense = req.body;
    await Expense.findByIdAndUpdate(expenseId, updatedExpense);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error updating expense' });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const expenseId = req.params.id;
    await Expense.findByIdAndDelete(expenseId);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense' });
  }
});

app.get('/api/maxMonthlyExpense', (req, res) => {
  res.json({ maxMonthlyExpense });
});

app.put('/api/maxMonthlyExpense', (req, res) => {
  maxMonthlyExpense = req.body.maxExpense;
  res.sendStatus(204);
});

app.get('/api/dashboard', (req, res) => {
  const totalExpense = expenses.reduce((total, expense) => total + expense.amount, 0);
  const isCloseToLimit = totalExpense >= 0.9 * maxMonthlyExpense;
  res.json({ totalExpense, isCloseToLimit });
});

// Calculate the total monthly expense
const calculateTotalMonthlyExpense = () => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

// API endpoint to fetch the total monthly expense and individual expense amounts
app.get('/api/expensePercentages', (req, res) => {
  const totalMonthlyExpense = calculateTotalMonthlyExpense();
  const individualExpenseAmounts = expenses.map((expense) => expense.amount);
  res.json({ totalMonthlyExpense, individualExpenseAmounts });
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

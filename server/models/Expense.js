const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    tripName: { type: String, required: true, trim: true, default: 'My Trip' },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Food', 'Transport', 'Stay', 'Shopping', 'Tickets', 'Fuel', 'Other'],
      default: 'Other',
    },
    amount: { type: Number, required: true, min: 0.01 },
    peopleCount: { type: Number, required: true, min: 1 },
    members: { type: [String], default: [] },
    paidBy: { type: String, trim: true, default: '' },
    perPerson: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);

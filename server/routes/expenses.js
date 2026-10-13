const express = require('express');
const Expense = require('../models/Expense');

const router = express.Router();
const round2 = (n) => Math.round(n * 100) / 100;

// GET /api/expenses?trip=Goa  -> history (newest first)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.trip ? { tripName: req.query.trip } : {};
    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/expenses/trips -> list of trips with totals
router.get('/trips', async (_req, res) => {
  try {
    const trips = await Expense.aggregate([
      {
        $group: {
          _id: '$tripName',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          lastUpdated: { $max: '$updatedAt' },
        },
      },
      { $sort: { lastUpdated: -1 } },
    ]);
    res.json(trips.map((t) => ({ tripName: t._id, total: round2(t.total), count: t.count })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/expenses -> add expense, split equally
router.post('/', async (req, res) => {
  try {
    const { tripName, title, category, amount, peopleCount, members, paidBy, date } = req.body;
    const amt = Number(amount);
    const people = Number(peopleCount);

    if (!title || !title.trim()) return res.status(400).json({ message: 'Title is required' });
    if (!(amt > 0)) return res.status(400).json({ message: 'Amount must be greater than 0' });
    if (!Number.isInteger(people) || people < 1)
      return res.status(400).json({ message: 'Number of people must be at least 1' });

    const expense = await Expense.create({
      tripName: (tripName || 'My Trip').trim(),
      title,
      category,
      amount: amt,
      peopleCount: people,
      members: Array.isArray(members) ? members.filter(Boolean) : [],
      paidBy,
      perPerson: round2(amt / people),
      date: date || Date.now(),
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const removed = await Expense.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

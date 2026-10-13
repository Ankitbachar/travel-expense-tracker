# 🧳 Trip Split – Travel Expense Tracker (MERN)

Add an expense, enter how many people are travelling, and the amount is split equally.
Every expense is saved in MongoDB so you can view the history of any trip later.

## Features
- Add expense: trip name, title, category, amount, number of people, date
- Automatic per-person split (shown live while typing)
- Optional member names + "paid by" → **per-person table** (total share, amount paid, balance) for each trip
- "Per person (total)" stat: what one person pays if they shared every expense in the trip
- History per trip (newest first), trip total, delete an expense
- Multiple trips supported (pick from the dropdown)

## Tech
- **M**ongoDB + Mongoose
- **E**xpress (REST API)
- **R**eact (Vite)
- **N**ode.js

## Run locally

Prerequisites: Node.js 18+ and MongoDB running locally (or a MongoDB Atlas URI).

```bash
# 1) Backend
cd server
npm install
cp .env.example .env     # edit MONGO_URI if needed
npm run dev              # http://localhost:5000

# 2) Frontend (new terminal)
cd client
npm install
npm run dev              # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend, so no extra config is needed.

## API
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/expenses?trip=Goa` | Expense history (optionally for one trip) |
| GET | `/api/expenses/trips` | All trips with totals |
| POST | `/api/expenses` | Add an expense (split is calculated server-side) |
| DELETE | `/api/expenses/:id` | Delete an expense |

Example body for `POST /api/expenses`:
```json
{
  "tripName": "Goa 2026",
  "title": "Dinner",
  "category": "Food",
  "amount": 2400,
  "peopleCount": 4,
  "members": ["Ankit", "Rahul", "Priya", "Sam"],
  "paidBy": "Ankit",
  "date": "2026-10-13"
}
```

## Folder structure
```
travel-expense-tracker/
├── server/   (Express + Mongoose)
│   ├── models/Expense.js
│   ├── routes/expenses.js
│   └── server.js
└── client/   (React + Vite)
    └── src/ (App.jsx, api.js, components/, styles.css)
```

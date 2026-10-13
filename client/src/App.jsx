import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { addExpense, deleteExpense, getExpenses, getTrips } from './api.js';
import ExpenseForm from './components/ExpenseForm.jsx';
import History from './components/History.jsx';
import PersonTotals from './components/PersonTotals.jsx';
import { money } from './utils.js';

export default function App() {
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    const list = await getTrips();
    setTrips(list);
    return list;
  }, []);

  const loadExpenses = useCallback(async (trip) => {
    setExpenses(await getExpenses(trip));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = await loadTrips();
        const first = list[0]?.tripName || '';
        setActiveTrip(first);
        await loadExpenses(first);
      } catch (e) {
        setError('Cannot reach the server. Is the backend running? (' + e.message + ')');
      } finally {
        setLoading(false);
      }
    })();
  }, [loadTrips, loadExpenses]);

  const selectTrip = async (trip) => {
    setActiveTrip(trip);
    setError('');
    try {
      await loadExpenses(trip);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAdd = async (payload) => {
    setError('');
    await addExpense(payload); // errors bubble up to the form
    await loadTrips();
    setActiveTrip(payload.tripName);
    await loadExpenses(payload.tripName);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      await loadExpenses(activeTrip);
      await loadTrips();
    } catch (e) {
      setError(e.message);
    }
  };

  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  // What one person pays in total if they shared every expense in the trip
  const perPersonTotal = useMemo(() => expenses.reduce((s, e) => s + e.perPerson, 0), [expenses]);

  return (
    <div className="app">
      <header className="hero">
        <h1>🧳 Trip Split</h1>
        <p>Add an expense, enter the number of people, and the cost is split instantly.</p>
      </header>

      {error && <div className="alert">{error}</div>}

      <main className="grid">
        <section className="card">
          <h2>Add expense</h2>
          <ExpenseForm onSubmit={handleAdd} trips={trips} defaultTrip={activeTrip} />
        </section>

        <section className="card">
          <div className="row between">
            <h2>History</h2>
            <select value={activeTrip} onChange={(e) => selectTrip(e.target.value)} aria-label="Select trip">
              {trips.length === 0 && <option value="">No trips yet</option>}
              {trips.map((t) => (
                <option key={t.tripName} value={t.tripName}>
                  {t.tripName} ({t.count})
                </option>
              ))}
            </select>
          </div>

          <div className="stats">
            <div>
              <span>Trip total</span>
              <strong>{money(total)}</strong>
            </div>
            <div title="Sum of each expense's per-person share">
              <span>Per person (total)</span>
              <strong>{money(perPersonTotal)}</strong>
            </div>
            <div>
              <span>Expenses</span>
              <strong>{expenses.length}</strong>
            </div>
          </div>

          {loading ? <p className="muted">Loading…</p> : <History expenses={expenses} onDelete={handleDelete} />}
          <PersonTotals expenses={expenses} />
        </section>
      </main>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { money } from '../utils.js';

const CATEGORIES = ['Food', 'Transport', 'Stay', 'Shopping', 'Tickets', 'Fuel', 'Other'];
const today = () => new Date().toISOString().slice(0, 10);

export default function ExpenseForm({ onSubmit, trips, defaultTrip }) {
  const [tripName, setTripName] = useState(defaultTrip || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [people, setPeople] = useState(2);
  const [names, setNames] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [date, setDate] = useState(today());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (defaultTrip) setTripName(defaultTrip);
  }, [defaultTrip]);

  const members = names.split(',').map((n) => n.trim()).filter(Boolean);
  const peopleCount = members.length > 0 ? members.length : Number(people);
  const perPerson = Number(amount) > 0 && peopleCount >= 1 ? Number(amount) / peopleCount : 0;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (members.length > 0 && paidBy && !members.map((m) => m.toLowerCase()).includes(paidBy.trim().toLowerCase())) {
      return setError('"Paid by" must be one of the member names.');
    }
    setSaving(true);
    try {
      await onSubmit({
        tripName: tripName.trim() || 'My Trip',
        title,
        category,
        amount: Number(amount),
        peopleCount,
        members,
        paidBy: paidBy.trim(),
        date,
      });
      setTitle('');
      setAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="form">
      <label>
        Trip name
        <input list="trip-list" value={tripName} onChange={(e) => setTripName(e.target.value)} placeholder="e.g. Goa 2026" required />
        <datalist id="trip-list">
          {trips.map((t) => (
            <option key={t.tripName} value={t.tripName} />
          ))}
        </datalist>
      </label>

      <label>
        What was it for?
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dinner, cab, hotel…" required />
      </label>

      <div className="row">
        <label>
          Amount (₹)
          <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Member names <span className="muted">(optional, comma separated)</span>
        <input value={names} onChange={(e) => setNames(e.target.value)} placeholder="Ankit, Rahul, Priya" />
      </label>

      <div className="row">
        <label>
          Number of people
          <input
            type="number"
            min="1"
            step="1"
            value={members.length > 0 ? members.length : people}
            disabled={members.length > 0}
            onChange={(e) => setPeople(e.target.value)}
            required
          />
        </label>
        <label>
          Paid by <span className="muted">(optional)</span>
          <input value={paidBy} onChange={(e) => setPaidBy(e.target.value)} placeholder="Name" />
        </label>
      </div>

      <label>
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>

      <div className="preview">
        Each person pays <strong>{money(perPerson)}</strong>
        <span className="muted"> ({peopleCount || 0} {peopleCount === 1 ? 'person' : 'people'})</span>
      </div>

      {error && <div className="alert">{error}</div>}
      <button className="primary" disabled={saving}>{saving ? 'Saving…' : 'Add expense'}</button>
    </form>
  );
}

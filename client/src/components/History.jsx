import React from 'react';
import { money } from '../utils.js';

const ICONS = { Food: '🍽️', Transport: '🚕', Stay: '🏨', Shopping: '🛍️', Tickets: '🎟️', Fuel: '⛽', Other: '📌' };

export default function History({ expenses, onDelete }) {
  if (expenses.length === 0) return <p className="muted">No expenses yet. Add your first one!</p>;

  return (
    <ul className="history">
      {expenses.map((e) => (
        <li key={e._id}>
          <div className="icon">{ICONS[e.category] || '📌'}</div>
          <div className="info">
            <strong>{e.title}</strong>
            <span className="muted">
              {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} ·{' '}
              {e.category}
              {e.paidBy ? ` · paid by ${e.paidBy}` : ''}
            </span>
            <span className="muted">
              {e.peopleCount} {e.peopleCount === 1 ? 'person' : 'people'}
              {e.members?.length ? ` (${e.members.join(', ')})` : ''}
            </span>
          </div>
          <div className="amounts">
            <strong>{money(e.amount)}</strong>
            <span className="muted">{money(e.perPerson)} each</span>
          </div>
          <button className="ghost" onClick={() => onDelete(e._id)} aria-label={`Delete ${e.title}`}>
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}

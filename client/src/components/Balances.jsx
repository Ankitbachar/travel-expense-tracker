import React, { useMemo } from 'react';
import { money } from '../utils.js';

// Net balance per person: positive = should get money back, negative = owes money.
// Only expenses that have member names and a "paid by" person are counted.
export default function Balances({ expenses }) {
  const balances = useMemo(() => {
    const net = {};
    for (const e of expenses) {
      if (!e.members?.length || !e.paidBy) continue;
      net[e.paidBy] = (net[e.paidBy] || 0) + e.amount;
      for (const m of e.members) net[m] = (net[m] || 0) - e.perPerson;
    }
    return Object.entries(net)
      .map(([name, value]) => [name, Math.round(value * 100) / 100])
      .sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  if (balances.length === 0) return null;

  return (
    <div className="balances">
      <h3>Who owes whom</h3>
      <ul>
        {balances.map(([name, value]) => (
          <li key={name}>
            <span>{name}</span>
            <strong className={value >= 0 ? 'pos' : 'neg'}>
              {value >= 0 ? 'gets back ' : 'owes '}
              {money(Math.abs(value))}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

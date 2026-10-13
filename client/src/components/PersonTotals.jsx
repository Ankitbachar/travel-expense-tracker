import React, { useMemo } from 'react';
import { money } from '../utils.js';

const r2 = (n) => Math.round(n * 100) / 100;

// Per-person totals for the selected trip.
//  - Total share: sum of this person's split of every expense they were part of
//  - Paid:        sum of expenses this person paid for
//  - Balance:     paid - share (only expenses with a "paid by" are counted)
export default function PersonTotals({ expenses }) {
  const { rows, unnamedCount, unnamedTotal } = useMemo(() => {
    const people = {};
    const get = (name) => (people[name] ||= { share: 0, paid: 0, shareWithPayer: 0 });
    let unnamedCount = 0;
    let unnamedTotal = 0;

    for (const e of expenses) {
      if (!e.members?.length) {
        unnamedCount += 1;
        unnamedTotal += e.amount;
        continue;
      }
      for (const m of e.members) {
        get(m).share += e.perPerson;
        if (e.paidBy) get(m).shareWithPayer += e.perPerson;
      }
      if (e.paidBy) get(e.paidBy).paid += e.amount;
    }

    const rows = Object.entries(people)
      .map(([name, p]) => ({
        name,
        share: r2(p.share),
        paid: r2(p.paid),
        balance: r2(p.paid - p.shareWithPayer),
      }))
      .sort((a, b) => b.share - a.share);

    return { rows, unnamedCount, unnamedTotal: r2(unnamedTotal) };
  }, [expenses]);

  if (rows.length === 0 && unnamedCount === 0) return null;

  return (
    <div className="balances">
      <h3>Per person (this trip)</h3>

      {rows.length > 0 && (
        <table className="people">
          <thead>
            <tr>
              <th>Person</th>
              <th>Total share</th>
              <th>Paid</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td><strong>{money(r.share)}</strong></td>
                <td>{money(r.paid)}</td>
                <td className={r.balance >= 0 ? 'pos' : 'neg'}>
                  {r.balance === 0 ? '—' : `${r.balance > 0 ? 'gets ' : 'owes '}${money(Math.abs(r.balance))}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {unnamedCount > 0 && (
        <p className="muted">
          {unnamedCount} {unnamedCount === 1 ? 'expense' : 'expenses'} ({money(unnamedTotal)}) have no member names, so
          they are not included in the table above.
        </p>
      )}
    </div>
  );
}

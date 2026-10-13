// Empty in local dev (Vite proxies /api). In production set VITE_API_URL to the backend URL.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(url, options) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const getExpenses = (trip) =>
  request(`/api/expenses${trip ? `?trip=${encodeURIComponent(trip)}` : ''}`);

export const getTrips = () => request('/api/expenses/trips');

export const addExpense = (payload) =>
  request('/api/expenses', { method: 'POST', body: JSON.stringify(payload) });

export const deleteExpense = (id) => request(`/api/expenses/${id}`, { method: 'DELETE' });

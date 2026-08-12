const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function apiGet(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API Error ${res.status}: ${body}`);
  }
  return res.json();
}

export async function apiPost(path, data) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API Error ${res.status}: ${body}`);
  }
  return res.json();
}

export default API_BASE_URL;

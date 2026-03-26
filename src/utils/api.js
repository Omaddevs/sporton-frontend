const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sporton-api.onrender.com';

export function getToken() {
  try { return localStorage.getItem('sporton_access_token'); } catch { return null; }
}

export function getRefreshToken() {
  try { return localStorage.getItem('sporton_refresh_token'); } catch { return null; }
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem('sporton_user')); } catch { return null; }
}

export function clearAuth() {
  try {
    localStorage.removeItem('sporton_access_token');
    localStorage.removeItem('sporton_refresh_token');
    localStorage.removeItem('sporton_user');
  } catch {}
}

/** Refresh the access token using the refresh token.
 *  Returns new access token on success, null on failure. */
async function tryRefreshToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.access) {
      localStorage.setItem('sporton_access_token', data.access);
      return data.access;
    }
  } catch {}
  return null;
}

/**
 * Main fetch helper. Auto-refreshes token on 401, clears auth if refresh fails.
 */
export async function apiFetch(path, opts = {}) {
  let token = getToken();

  const doRequest = (t) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...(opts.headers || {}),
      },
    });

  let res = await doRequest(token);

  // 401 → try refresh once
  if (res.status === 401) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      // Retry with fresh token
      res = await doRequest(newToken);
    } else {
      // Refresh failed — clear stale auth silently
      clearAuth();
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || data?.message || `HTTP ${res.status}`);
  return data;
}

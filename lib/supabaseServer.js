// Server-only: bare fetch() against the Supabase REST API.
// Used in server components instead of the supabase-js client to avoid
// the client-init overhead that triggers Cloudflare Worker CPU limits.
// PostgREST filter reference: https://postgrest.org/en/stable/api.html

const BASE = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * @param {string} table
 * @param {Record<string, string>} params  PostgREST query params
 * @param {{ revalidate?: number }} opts
 * @returns {Promise<{ data: any[], error: string | null }>}
 */
export async function serverFetch(table, params = {}, { revalidate = 60 } = {}) {
  if (!BASE || !KEY) return { data: [], error: 'Missing Supabase env vars' };

  const qs = new URLSearchParams(params).toString();
  const url = `${BASE}/rest/v1/${table}${qs ? '?' + qs : ''}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        Accept: 'application/json',
      },
      next: { revalidate },
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      return { data: [], error: `HTTP ${res.status}: ${text}` };
    }

    const data = await res.json();
    return { data: Array.isArray(data) ? data : [], error: null };
  } catch (e) {
    return { data: [], error: e.message };
  } finally {
    clearTimeout(timeout);
  }
}

export async function serverRpc(functionName, params = {}, { revalidate = 60 } = {}) {
  if (!BASE || !KEY) return { data: null, error: 'Missing Supabase env vars' };

  const url = `${BASE}/rest/v1/rpc/${functionName}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(params),
      next: { revalidate },
    });

    if (!res.ok) {
      const text = await res.text();
      return { data: null, error: `HTTP ${res.status}: ${text}` };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e.message };
  }
}

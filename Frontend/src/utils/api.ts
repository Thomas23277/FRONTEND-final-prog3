// src/utils/api.ts
export const BASE_URL = 'http://localhost:8080/api';

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
      credentials: 'include',
      body: options.body,
    });
  } catch (err) {
    console.error(`Network error calling ${url}:`, err);
    throw new Error('No se pudo conectar con el servidor');
  }

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || `Error ${res.status}`;
    console.error(`API error ${res.status} ${url}:`, message);
    throw new Error(message);
  }

  return data;
}

export async function apiGet(path: string) {
  return await request(path, { method: 'GET' });
}

export async function apiPost(path: string, body?: any) {
  return await request(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function apiPut(path: string, body?: any) {
  return await request(path, { method: 'PUT', body: JSON.stringify(body) });
}

export async function apiDelete(path: string) {
  return await request(path, { method: 'DELETE' });
}
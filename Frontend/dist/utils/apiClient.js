import { API_URL } from '../config/api';
export async function apiFetch(path, options = {}) {
    const url = path.startsWith('/api') ? `${API_URL}${path}` : (path.startsWith('http') ? path : `${API_URL}/${path}`);
    const opts = {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
    };
    const res = await fetch(url, opts);
    if (!res.ok) {
        const text = await res.text();
        let body = text;
        try {
            body = JSON.parse(text);
        }
        catch (e) { }
        throw { status: res.status, body };
    }
    try {
        return await res.json();
    }
    catch (e) {
        return null;
    }
}

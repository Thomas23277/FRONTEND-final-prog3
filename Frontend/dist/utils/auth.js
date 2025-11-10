import { BASE_URL } from './api';

const LS_KEY = 'foodstore_user';

/**
 * Inicia sesión (el backend no usa contraseña)
 */
export async function login(email) {
  try {
    const url = `${BASE_URL.replace('/api', '')}/api/usuarios/login?email=${encodeURIComponent(email)}`;
    const res = await fetch(url, { method: 'POST' });

    if (!res.ok) throw new Error('Error al iniciar sesión');

    const user = await res.json();
    if (!user?.id || !user?.email) throw new Error('Usuario inválido o sin datos.');

    const userData = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      role: user.role || 'cliente',
    };

    localStorage.setItem(LS_KEY, JSON.stringify(userData));
    return userData;
  } catch (err) {
    console.error('❌ Error en login:', err);
    throw new Error(err.message || 'Error al iniciar sesión');
  }
}

/**
 * Registra un usuario (o lo obtiene si ya existe)
 */
export async function register(name, email, password) {
  try {
    // ⚠️ No mandamos JSON ni headers, tu backend espera los parámetros en la URL
    const url = `${BASE_URL.replace('/api', '')}/api/usuarios/login?email=${encodeURIComponent(email)}&nombre=${encodeURIComponent(name)}`;
    const res = await fetch(url, { method: 'POST' });

    if (!res.ok) throw new Error('Error al registrar usuario');

    const user = await res.json();
    if (!user?.id || !user?.email) throw new Error('Usuario inválido o sin datos.');

    const userData = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      role: user.role || 'cliente',
    };

    localStorage.setItem(LS_KEY, JSON.stringify(userData));
    return userData;
  } catch (err) {
    console.error('❌ Error en register:', err);
    throw new Error(err.message || 'Error al registrar usuario');
  }
}

/**
 * Cierra sesión
 */
export function logout() {
  localStorage.removeItem(LS_KEY);
}

/**
 * Devuelve el usuario actual
 */
export function getUser() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Verifica si el usuario actual es admin
 */
export function isAdmin() {
  const user = getUser();
  return !!user && user.role?.toLowerCase() === 'admin';
}

export const getCurrentUser = getUser;

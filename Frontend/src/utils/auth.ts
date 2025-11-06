import { apiPost } from './api';

const LS_KEY = 'foodstore_user';

export interface IUser {
  id: number;
  name: string;
  email: string;
  role: string;
  token?: string; // opcional, en caso de que el backend lo devuelva
}

/**
 * Inicia sesión con email y contraseña.
 * Guarda el usuario en localStorage si el login es exitoso.
 */
export async function login(email: string, password: string): Promise<IUser> {
  try {
    const payload = { email, password };
    const res = await apiPost('/auth/login', payload);

    // Normaliza la respuesta
    const user = res?.user || res;
    if (!user || !user.email) throw new Error('Credenciales incorrectas o respuesta inválida');

    localStorage.setItem(LS_KEY, JSON.stringify(user));
    return user as IUser;
  } catch (err: any) {
    throw new Error(err.message || 'Error al iniciar sesión');
  }
}

/**
 * Registra un nuevo usuario.
 * Guarda el usuario en localStorage si el registro es exitoso.
 */
export async function register(name: string, email: string, password: string): Promise<IUser> {
  try {
    const payload = { name, email, password };
    const res = await apiPost('/auth/register', payload);

    const user = res?.user || res;
    if (!user || !user.email) throw new Error('Error en el registro o respuesta inválida');

    localStorage.setItem(LS_KEY, JSON.stringify(user));
    return user as IUser;
  } catch (err: any) {
    throw new Error(err.message || 'Error al registrar usuario');
  }
}

/**
 * Elimina los datos del usuario actual.
 */
export function logout(): void {
  localStorage.removeItem(LS_KEY);
}

/**
 * Obtiene el usuario guardado en localStorage, o null si no hay.
 */
export function getUser(): IUser | null {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as IUser;
  } catch {
    return null;
  }
}

/**
 * Verifica si el usuario actual es administrador.
 */
export function isAdmin(): boolean {
  const user = getUser();
  return !!user && user.role?.toLowerCase() === 'admin';
}

export const getCurrentUser = getUser;

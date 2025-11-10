const API_URL = "http://localhost:8080"; // ajustá si tu backend corre en otro puerto

/**
 * 🔐 Inicia sesión de usuario existente
 * Si el usuario no existe, devuelve error.
 */
export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/usuarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error(text || `Error ${res.status}`);
  }

  const user = await res.json();

  // Guardar usuario en localStorage
  localStorage.setItem("currentUser", JSON.stringify(user));

  return user;
}

/**
 * 📝 Registra un nuevo usuario (solo si no existe)
 */
export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/api/usuarios/register`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ nombre: name, email, password }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error(text || `Error ${res.status}`);
  }

  const user = await res.json();

  // Guardar usuario recién registrado
  localStorage.setItem("currentUser", JSON.stringify(user));

  return user;
}

/**
 * 🔍 Obtener el usuario actual desde localStorage
 */
export function getCurrentUser() {
  const userData = localStorage.getItem("currentUser");
  if (!userData) return null;

  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

/**
 * 🚪 Cerrar sesión
 */
export function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "/src/pages/auth/login/login.html";
}

import { getCurrentUser, logout } from "../../../utils/auth";

const user = getCurrentUser();

if (!user || user.role !== 'admin') {
  // Si no es admin, redirige al login
  alert('Acceso denegado. Debes iniciar sesión como administrador.');
  window.location.href = '/src/pages/auth/login/login.html';
} else {
  console.log('👑 Admin autenticado:', user.email);

  // Botón de cerrar sesión
  const b = document.createElement('button');
  b.textContent = 'Cerrar sesión';
  b.addEventListener('click', () => {
    logout();
    window.location.href = '/';
  });

  document.body.appendChild(b);
}

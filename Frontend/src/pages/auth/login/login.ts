// src/pages/auth/login/login.ts
import { login } from '../../../utils/auth';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form') as HTMLFormElement | null;
  const msg = document.getElementById('msg') as HTMLElement | null;

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg && (msg.textContent = '');

    const email = (document.getElementById('email') as HTMLInputElement).value.trim();
    const password = (document.getElementById('password') as HTMLInputElement).value.trim();

    if (!email || !password) {
      if (msg) {
        msg.textContent = 'Debes ingresar tu correo y contraseña.';
        msg.style.color = '#c0392b';
      }
      return;
    }

    try {
      // 🔹 Llamamos a /api/auth/login
      const user = await login(email, password);

      if (!user || !user.id || !user.email) {
        throw new Error('Respuesta inválida del servidor.');
      }

      localStorage.setItem('foodstore_user', JSON.stringify(user));

      if (msg) {
        msg.textContent = 'Inicio de sesión correcto. Redirigiendo...';
        msg.style.color = '#27ae60';
      }

      setTimeout(() => {
        window.location.href = '/src/pages/store/home/home.html';
      }, 700);
    } catch (err: any) {
      console.error('Login error:', err);
      if (msg) {
        msg.textContent = 'Error al iniciar sesión: ' + (err.message || 'Verifica tus credenciales');
        msg.style.color = '#c0392b';
      }
    }
  });
});

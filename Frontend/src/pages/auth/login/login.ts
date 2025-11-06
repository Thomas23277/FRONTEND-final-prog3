// src/pages/auth/login/login.ts
import { apiPost } from '../../../utils/api';

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
        msg.textContent = 'Completá email y contraseña';
        msg.style.color = '#c0392b';
      }
      return;
    }

    try {
      const res = await apiPost('/auth/login', { email, password });

      // Estructura flexible (según backend)
      const user = res.usuario || res.user || res;
      if (!user || (!user.id && !user.email && !res.token)) {
        throw new Error('Respuesta inválida del servidor');
      }

      const name = user.nombre || user.name || user.nombreCompleto || user.fullName || user.email;

      // ✅ Guardamos con la clave 'usuario'
      localStorage.setItem('usuario', JSON.stringify({
        id: user.id || null,
        nombre: name,
        email: user.email || email,
        token: res.token || null
      }));

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

// src/pages/auth/register/register.ts
import { register } from '../../../utils/auth';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form') as HTMLFormElement | null;
  const nameInput = document.getElementById('name') as HTMLInputElement | null;
  const emailInput = document.getElementById('email') as HTMLInputElement | null;
  const passInput = document.getElementById('password') as HTMLInputElement | null;
  const msg = document.getElementById('msg') as HTMLElement | null;

  if (!form || !nameInput || !emailInput || !passInput) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passInput.value.trim();

    if (!name || !email || !password) {
      if (msg) {
        msg.textContent = 'Completá todos los campos obligatorios.';
        msg.style.color = '#c0392b';
      }
      return;
    }

    if (password.length < 6) {
      if (msg) {
        msg.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        msg.style.color = '#c0392b';
      }
      return;
    }

    try {
      // 🔹 Llamamos a /api/auth/register
      const user = await register(name, email, password);

      if (!user || !user.id || !user.email) {
        throw new Error('Respuesta inválida del servidor.');
      }

      localStorage.setItem('foodstore_user', JSON.stringify(user));

      if (msg) {
        msg.textContent = 'Registro exitoso. Redirigiendo...';
        msg.style.color = '#27ae60';
      }

      setTimeout(() => {
        window.location.href = '/src/pages/store/home/home.html';
      }, 700);
    } catch (err: any) {
      console.error('❌ Error en registro:', err);
      if (msg) {
        msg.textContent = 'Error en el registro: ' + (err.message || 'Inténtalo de nuevo');
        msg.style.color = '#c0392b';
      }
    }
  });
});

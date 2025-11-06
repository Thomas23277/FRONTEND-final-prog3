import { register } from '../../../utils/auth';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form') as HTMLFormElement | null;
  const nameInput = document.getElementById('name') as HTMLInputElement | null;
  const emailInput = document.getElementById('email') as HTMLInputElement | null;
  const passInput = document.getElementById('password') as HTMLInputElement | null;
  const msg = document.getElementById('msg');
  if (!form || !nameInput || !emailInput || !passInput) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passInput.value.trim();
    if (!name || !email || password.length < 6) {
      if (msg) msg.textContent = 'Completa los campos. Contraseña mínimo 6 caracteres.';
      return;
    }
    try {
      const user = await register(name, email, password);
      // después de registrar, redirigir a home de cliente
      window.location.href = '/src/pages/store/home/home.html';
    } catch (err: any) {
      if (msg) msg.textContent = err.message || 'Error en el registro';
    }
  });
});

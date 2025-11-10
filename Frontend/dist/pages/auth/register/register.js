import { register } from '../../../utils/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
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
      console.log("✅ Usuario registrado:", user);
      window.location.href = '/src/pages/store/home/home.html';
    } catch (err) {
      console.error("❌ Error en registro:", err);
      if (msg) msg.textContent = err.message || 'Error en el registro';
    }
  });
});

import { apiGet, apiPost, apiPut, apiDelete } from '../../../utils/api';

interface Categoria { id?: number; nombre: string; descripcion: string; urlImagen: string; }

async function loadCategories() {
  const list = await apiGet('/categoria');
  renderTable(list || []);
}

function renderTable(items: Categoria[]) {
  const tbody = document.getElementById('categories-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  items.forEach((c) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.id ?? ''}</td>
      <td><img src="${c.urlImagen}" style="width:60px;height:40px;object-fit:cover" /></td>
      <td>${c.nombre}</td>
      <td>${c.descripcion}</td>
      <td>
        <button class="edit" data-id="${c.id}">Editar</button>
        <button class="del" data-id="${c.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  attachActions();
}

function attachActions() {
  document.querySelectorAll('button.edit').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      const item = await apiGet('/categoria/' + id);
      // rellenar modal/form
      const nombre = document.getElementById('cat-nombre') as HTMLInputElement;
      const descripcion = document.getElementById('cat-descripcion') as HTMLInputElement;
      const url = document.getElementById('cat-url') as HTMLInputElement;
      const idInput = document.getElementById('cat-id') as HTMLInputElement;
      if (nombre && descripcion && url && idInput) {
        nombre.value = item.nombre || '';
        descripcion.value = item.descripcion || '';
        url.value = item.urlImagen || '';
        idInput.value = item.id || '';
      }
    });
  });
  document.querySelectorAll('button.del').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      if (!confirm('Confirmar eliminación')) return;
      await apiDelete('/categoria/' + id);
      await loadCategories();
    });
  });
}

async function saveCategory(e?: Event) {
  e?.preventDefault();
  const idInput = document.getElementById('cat-id') as HTMLInputElement | null;
  const nombre = (document.getElementById('cat-nombre') as HTMLInputElement).value.trim();
  const descripcion = (document.getElementById('cat-descripcion') as HTMLInputElement).value.trim();
  const url = (document.getElementById('cat-url') as HTMLInputElement).value.trim();
  if (!nombre || !descripcion || !url) {
    alert('Completar todos los campos');
    return;
  }
  const payload = { nombre, descripcion, urlImagen: url };
  if (idInput && idInput.value) {
    await apiPut('/categoria/' + idInput.value, payload);
  } else {
    await apiPost('/categoria', payload);
  }
  // limpiar y recargar
  (document.getElementById('cat-id') as HTMLInputElement).value = '';
  (document.getElementById('cat-nombre') as HTMLInputElement).value = '';
  (document.getElementById('cat-descripcion') as HTMLInputElement).value = '';
  (document.getElementById('cat-url') as HTMLInputElement).value = '';
  await loadCategories();
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cat-form') as HTMLFormElement | null;
  if (form) form.addEventListener('submit', saveCategory);
  loadCategories();
});

export { loadCategories, saveCategory };

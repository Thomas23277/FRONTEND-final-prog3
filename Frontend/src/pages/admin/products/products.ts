import { apiGet, apiPost, apiPut, apiDelete } from '../../../utils/api';

interface Producto { id?: number; nombre: string; descripcion: string; precio: number; stock: number; categoriaId?: number; urlImagen: string; disponible: boolean; }

async function loadProducts() {
  const list = await apiGet('/producto');
  renderTable(list || []);
  // cargar categorias para el select
  const cats = await apiGet('/categoria');
  const sel = document.getElementById('prod-categoria') as HTMLSelectElement | null;
  if (sel) {
    sel.innerHTML = '<option value="">Seleccione</option>' + (cats || []).map((c:any) => `<option value="${c.id}">${c.nombre}</option>`).join('');
  }
}

function renderTable(items: Producto[]) {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  items.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id ?? ''}</td>
      <td><img src="${p.urlImagen}" style="width:60px;height:40px;object-fit:cover" /></td>
      <td>${p.nombre}</td>
      <td>${p.descripcion}</td>
      <td>$${p.precio.toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>${p.categoriaId ?? ''}</td>
      <td>${p.disponible ? 'Sí' : 'No'}</td>
      <td>
        <button class="edit" data-id="${p.id}">Editar</button>
        <button class="del" data-id="${p.id}">Eliminar</button>
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
      const item = await apiGet('/producto/' + id);
      // rellenar form
      (document.getElementById('prod-id') as HTMLInputElement).value = item.id || '';
      (document.getElementById('prod-nombre') as HTMLInputElement).value = item.nombre || '';
      (document.getElementById('prod-descripcion') as HTMLInputElement).value = item.descripcion || '';
      (document.getElementById('prod-precio') as HTMLInputElement).value = item.precio || '';
      (document.getElementById('prod-stock') as HTMLInputElement).value = item.stock || '';
      (document.getElementById('prod-url') as HTMLInputElement).value = item.urlImagen || '';
      (document.getElementById('prod-disponible') as HTMLInputElement).checked = !!item.disponible;
      (document.getElementById('prod-categoria') as HTMLSelectElement).value = item.categoriaId || '';
    });
  });
  document.querySelectorAll('button.del').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      if (!confirm('Confirmar eliminación')) return;
      await apiDelete('/producto/' + id);
      await loadProducts();
    });
  });
}

async function saveProduct(e?: Event) {
  e?.preventDefault();
  const id = (document.getElementById('prod-id') as HTMLInputElement).value;
  const nombre = (document.getElementById('prod-nombre') as HTMLInputElement).value.trim();
  const descripcion = (document.getElementById('prod-descripcion') as HTMLInputElement).value.trim();
  const precio = parseFloat((document.getElementById('prod-precio') as HTMLInputElement).value) || 0;
  const stock = parseInt((document.getElementById('prod-stock') as HTMLInputElement).value) || 0;
  const url = (document.getElementById('prod-url') as HTMLInputElement).value.trim();
  const dispo = (document.getElementById('prod-disponible') as HTMLInputElement).checked;
  const categoriaId = parseInt((document.getElementById('prod-categoria') as HTMLSelectElement).value) || undefined;
  if (!nombre || !descripcion || precio <= 0 || stock < 0 || !url) { alert('Completar campos correctos'); return; }
  const payload: any = { nombre, descripcion, precio, stock, urlImagen: url, disponible: dispo, categoriaId };
  if (id) {
    await apiPut('/producto/' + id, payload);
  } else {
    await apiPost('/producto', payload);
  }
  // limpiar
  (document.getElementById('prod-id') as HTMLInputElement).value = '';
  (document.getElementById('prod-nombre') as HTMLInputElement).value = '';
  (document.getElementById('prod-descripcion') as HTMLInputElement).value = '';
  (document.getElementById('prod-precio') as HTMLInputElement).value = '';
  (document.getElementById('prod-stock') as HTMLInputElement).value = '';
  (document.getElementById('prod-url') as HTMLInputElement).value = '';
  (document.getElementById('prod-disponible') as HTMLInputElement).checked = false;
  await loadProducts();
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('prod-form') as HTMLFormElement | null;
  if (form) form.addEventListener('submit', saveProduct);
  loadProducts();
});

export { loadProducts, saveProduct };

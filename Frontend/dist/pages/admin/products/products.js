import { apiGet, apiPost, apiPut, apiDelete } from '../../../utils/api';
async function loadProducts() {
    const list = await apiGet('/producto');
    renderTable(list || []);
    // cargar categorias para el select
    const cats = await apiGet('/categoria');
    const sel = document.getElementById('prod-categoria');
    if (sel) {
        sel.innerHTML = '<option value="">Seleccione</option>' + (cats || []).map((c) => `<option value="${c.id}">${c.nombre}</option>`).join('');
    }
}
function renderTable(items) {
    const tbody = document.getElementById('products-tbody');
    if (!tbody)
        return;
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
            const id = e.currentTarget.getAttribute('data-id');
            const item = await apiGet('/producto/' + id);
            // rellenar form
            document.getElementById('prod-id').value = item.id || '';
            document.getElementById('prod-nombre').value = item.nombre || '';
            document.getElementById('prod-descripcion').value = item.descripcion || '';
            document.getElementById('prod-precio').value = item.precio || '';
            document.getElementById('prod-stock').value = item.stock || '';
            document.getElementById('prod-url').value = item.urlImagen || '';
            document.getElementById('prod-disponible').checked = !!item.disponible;
            document.getElementById('prod-categoria').value = item.categoriaId || '';
        });
    });
    document.querySelectorAll('button.del').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (!confirm('Confirmar eliminación'))
                return;
            await apiDelete('/producto/' + id);
            await loadProducts();
        });
    });
}
async function saveProduct(e) {
    e?.preventDefault();
    const id = document.getElementById('prod-id').value;
    const nombre = document.getElementById('prod-nombre').value.trim();
    const descripcion = document.getElementById('prod-descripcion').value.trim();
    const precio = parseFloat(document.getElementById('prod-precio').value) || 0;
    const stock = parseInt(document.getElementById('prod-stock').value) || 0;
    const url = document.getElementById('prod-url').value.trim();
    const dispo = document.getElementById('prod-disponible').checked;
    const categoriaId = parseInt(document.getElementById('prod-categoria').value) || undefined;
    if (!nombre || !descripcion || precio <= 0 || stock < 0 || !url) {
        alert('Completar campos correctos');
        return;
    }
    const payload = { nombre, descripcion, precio, stock, urlImagen: url, disponible: dispo, categoriaId };
    if (id) {
        await apiPut('/producto/' + id, payload);
    }
    else {
        await apiPost('/producto', payload);
    }
    // limpiar
    document.getElementById('prod-id').value = '';
    document.getElementById('prod-nombre').value = '';
    document.getElementById('prod-descripcion').value = '';
    document.getElementById('prod-precio').value = '';
    document.getElementById('prod-stock').value = '';
    document.getElementById('prod-url').value = '';
    document.getElementById('prod-disponible').checked = false;
    await loadProducts();
}
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prod-form');
    if (form)
        form.addEventListener('submit', saveProduct);
    loadProducts();
});
export { loadProducts, saveProduct };

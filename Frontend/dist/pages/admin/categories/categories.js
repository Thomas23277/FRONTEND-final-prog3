import { apiGet, apiPost, apiPut, apiDelete } from '../../../utils/api';
async function loadCategories() {
    const list = await apiGet('/categoria');
    renderTable(list || []);
}
function renderTable(items) {
    const tbody = document.getElementById('categories-tbody');
    if (!tbody)
        return;
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
            const id = e.currentTarget.getAttribute('data-id');
            const item = await apiGet('/categoria/' + id);
            // rellenar modal/form
            const nombre = document.getElementById('cat-nombre');
            const descripcion = document.getElementById('cat-descripcion');
            const url = document.getElementById('cat-url');
            const idInput = document.getElementById('cat-id');
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
            const id = e.currentTarget.getAttribute('data-id');
            if (!confirm('Confirmar eliminación'))
                return;
            await apiDelete('/categoria/' + id);
            await loadCategories();
        });
    });
}
async function saveCategory(e) {
    e?.preventDefault();
    const idInput = document.getElementById('cat-id');
    const nombre = document.getElementById('cat-nombre').value.trim();
    const descripcion = document.getElementById('cat-descripcion').value.trim();
    const url = document.getElementById('cat-url').value.trim();
    if (!nombre || !descripcion || !url) {
        alert('Completar todos los campos');
        return;
    }
    const payload = { nombre, descripcion, urlImagen: url };
    if (idInput && idInput.value) {
        await apiPut('/categoria/' + idInput.value, payload);
    }
    else {
        await apiPost('/categoria', payload);
    }
    // limpiar y recargar
    document.getElementById('cat-id').value = '';
    document.getElementById('cat-nombre').value = '';
    document.getElementById('cat-descripcion').value = '';
    document.getElementById('cat-url').value = '';
    await loadCategories();
}
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cat-form');
    if (form)
        form.addEventListener('submit', saveCategory);
    loadCategories();
});
export { loadCategories, saveCategory };

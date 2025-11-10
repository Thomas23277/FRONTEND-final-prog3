"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const usuarioGuardado = localStorage.getItem("user") || localStorage.getItem("usuario");
    if (!usuarioGuardado)
        localStorage.removeItem("carrito");
    const menuBtn = document.getElementById("menu-btn");
    const sidebar = document.getElementById("sidebar");
    const logoutBtn = document.getElementById("logout-sidebar");
    const productListEl = document.getElementById("product-list");
    const productCountEl = document.getElementById("product-count");
    const userInfo = document.getElementById("user-info");
    const cartBtn = document.getElementById("cart-button");
    const cartBadge = document.getElementById("cart-badge");

    function loadCartFromStorage() { try {
        return JSON.parse(localStorage.getItem("carrito") || "[]");
    }
    catch {
        return [];
    } }
    function updateCartBadge() { const cart = loadCartFromStorage(); const total = cart.reduce((s, i) => s + (Number(i.cantidad) || 0), 0); if (cartBadge) {
        cartBadge.textContent = String(total);
        cartBadge.style.display = total > 0 ? 'inline-block' : 'none';
    } }
    if (cartBtn)
        cartBtn.addEventListener("click", () => window.location.href = "/src/pages/store/cart/cart.html");
    const usuarioData = localStorage.getItem("user") || localStorage.getItem("usuario");
    let usuarioNombre = "Invitado";
    if (usuarioData) {
        try {
            const usuario = JSON.parse(usuarioData);
            usuarioNombre = usuario.name || usuario.nombre || usuario.username || usuario.email || "Invitado";
        }
        catch {
            usuarioNombre = usuarioData;
        }
    }
    if (userInfo)
        userInfo.textContent = `👋 Hola, ${usuarioNombre}`;
    if (menuBtn && sidebar)
        menuBtn.addEventListener("click", () => sidebar.classList.toggle("active"));
    if (logoutBtn)
        logoutBtn.addEventListener("click", () => { localStorage.removeItem("user"); localStorage.removeItem("usuario"); localStorage.removeItem("carrito"); localStorage.removeItem("productoSeleccionado"); window.location.href = "/src/pages/auth/login/login.html"; });
    async function cargarProductos() {
        let productos = [];
        try {
            const r = await fetch(`${API_URL}/api/producto`);
            if (!r.ok)
                throw new Error("no products");
            productos = await r.json();
        }
        catch (e) {
            productos = [{ id: 1, nombre: 'Agua', descripcion: 'Botella 2L', precio: 2500, stock: 10 }, { id: 2, nombre: 'Doritos', descripcion: 'Snack', precio: 3000, stock: 5 }];
        }
        renderProductos(productos);
    }
    function renderProductos(lista) {
        if (!productListEl)
            return;
        productListEl.innerHTML = "";
        if (productCountEl)
            productCountEl.textContent = `${lista.length} producto${lista.length !== 1 ? 's' : ''}`;
        lista.forEach(p => {
            const card = document.createElement("div");
            card.className = "product-card";
            const img = `https://picsum.photos/seed/${encodeURIComponent(p.nombre)}/300/200`;
            card.innerHTML = `<div class="img-container"><img src="${img}" alt="${p.nombre}"/><span class="badge ${p.stock > 0 ? 'available' : 'unavailable'}">${p.stock > 0 ? 'Disponible' : 'Sin stock'}</span></div><h4>${p.nombre}</h4><p>${p.descripcion || ''}</p><p><b>$${p.precio.toLocaleString()}</b></p>`;
            card.addEventListener("click", () => { localStorage.setItem("productoSeleccionado", JSON.stringify(p)); window.location.href = `/src/pages/store/productDetail/productDetail.html?id=${p.id}`; });
            productListEl.appendChild(card);
        });
    }
    cargarProductos();
    updateCartBadge();
});

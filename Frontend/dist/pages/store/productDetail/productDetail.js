"use strict";
document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const imgEl = document.getElementById("product-img");
    const nameEl = document.getElementById("product-name");
    const descEl = document.getElementById("product-desc");
    const priceEl = document.getElementById("product-price");
    const statusEl = document.getElementById("product-status");
    const quantityEl = document.getElementById("quantity");
    const addBtn = document.getElementById("add-to-cart-btn");
    const messageEl = document.getElementById("message");
    const backBtn = document.getElementById("back-btn");
    const cartBadge = document.getElementById("cart-badge");
    if (backBtn)
        backBtn.addEventListener("click", () => window.history.back());
    function loadCart() {
        try {
            return JSON.parse(localStorage.getItem("carrito") || "[]");
        }
        catch {
            return [];
        }
    }
    function saveCart(c) {
        localStorage.setItem("carrito", JSON.stringify(c));
        updateBadge();
    }
    function updateBadge() {
        if (!cartBadge)
            return;
        const c = loadCart();
        const t = c.reduce((s, i) => s + (Number(i.cantidad) || 0), 0);
        cartBadge.textContent = String(t);
        cartBadge.style.display = t > 0 ? "inline-block" : "none";
    }
    window.addEventListener("storage", (e) => {
        if (e.key === "carrito")
            updateBadge();
    });
    if (!id) {
        if (messageEl)
            messageEl.textContent = "Producto no encontrado";
        return;
    }
    try {
        const r = await fetch(`http://localhost:8080/api/producto/${id}`);
        if (!r.ok)
            throw new Error("no product");
        const product = await r.json();
        const stock = Number(product.stock) || 0;
        if (imgEl)
            imgEl.src = product.imagen || `https://picsum.photos/seed/${encodeURIComponent(product.nombre)}/400/300`;
        if (nameEl)
            nameEl.textContent = product.nombre;
        if (descEl)
            descEl.textContent = product.descripcion || "";
        if (priceEl)
            priceEl.textContent = `$${product.precio.toLocaleString()}`;
        if (statusEl && addBtn) {
            if (stock > 0) {
                statusEl.textContent = `Disponible (${stock} unidades)`;
                statusEl.classList.add("available");
            }
            else {
                statusEl.textContent = "Sin stock";
                statusEl.classList.add("unavailable");
                addBtn.disabled = true;
            }
        }
        if (addBtn) {
            addBtn.addEventListener("click", () => {
                if (!quantityEl || !messageEl)
                    return;
                const cantidad = Math.max(1, Number(quantityEl.value) || 1);
                if (cantidad > stock) {
                    messageEl.textContent = `No hay suficiente stock. Disponible: ${stock}`;
                    return;
                }
                const cart = loadCart();
                const existing = cart.find(it => it.id === product.id);
                if (existing) {
                    if (existing.cantidad + cantidad > stock) {
                        messageEl.textContent = `Stock insuficiente. Solo quedan ${stock}`;
                        return;
                    }
                    existing.cantidad += cantidad;
                }
                else {
                    cart.push({ id: product.id, nombre: product.nombre, precio: product.precio, imagen: product.imagen, cantidad, stock });
                }
                saveCart(cart);
                messageEl.textContent = "✅ Producto agregado al carrito.";
                quantityEl.value = "1";
            });
        }
        updateBadge();
    }
    catch (e) {
        console.error(e);
        if (messageEl)
            messageEl.textContent = "Error al cargar producto";
    }
});

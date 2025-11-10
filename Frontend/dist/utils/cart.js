"use strict";
// ✅ cart.ts — versión final corregida y funcional
document.addEventListener("DOMContentLoaded", () => {
    // Recuperar datos del localStorage
    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    const user = JSON.parse(localStorage.getItem("foodstore_user") || "null");
    // Referencias al DOM
    const btnComprar = document.getElementById("btnComprar");
    const btnVaciar = document.getElementById("btnVaciar");
    const contenedorCarrito = document.getElementById("carrito");
    const totalSpan = document.getElementById("total");
    // Validar existencia de elementos HTML
    if (!contenedorCarrito || !totalSpan) {
        console.warn("⚠️ No se encontró el contenedor del carrito o el total en el DOM.");
        return;
    }
    // 🔄 Renderizar carrito
    function renderCarrito() {
        if (!contenedorCarrito || !totalSpan)
            return; // seguridad adicional
        contenedorCarrito.innerHTML = "";
        let total = 0;
        if (carrito.length === 0) {
            contenedorCarrito.innerHTML = `<p>🛒 El carrito está vacío.</p>`;
            totalSpan.textContent = "$0";
            return;
        }
        carrito.forEach((item, index) => {
            const cantidad = item.cantidad || 1;
            const subtotal = item.precio * cantidad;
            total += subtotal;
            const div = document.createElement("div");
            div.className = "item-carrito";
            div.innerHTML = `
        <b>${item.nombre}</b> - $${item.precio.toLocaleString()}
        <br>Cantidad:
        <input type="number" id="cant-${index}" min="1" value="${cantidad}" style="width:60px">
        <button id="del-${index}" style="margin-left:8px;background:#c00;color:#fff;border:none;padding:2px 6px;border-radius:4px;cursor:pointer">
          X
        </button>
        <hr>
      `;
            contenedorCarrito.appendChild(div);
            // 🧮 Modificar cantidad
            const inputCantidad = document.getElementById(`cant-${index}`);
            inputCantidad?.addEventListener("change", (e) => {
                const target = e.target;
                const nuevaCantidad = parseInt(target.value) || 1;
                carrito[index].cantidad = nuevaCantidad;
                localStorage.setItem("carrito", JSON.stringify(carrito));
                renderCarrito();
            });
            // ❌ Eliminar producto
            const btnEliminar = document.getElementById(`del-${index}`);
            btnEliminar?.addEventListener("click", () => {
                carrito.splice(index, 1);
                localStorage.setItem("carrito", JSON.stringify(carrito));
                renderCarrito();
            });
        });
        totalSpan.textContent = `$${total.toLocaleString()}`;
    }
    renderCarrito();
    // 🧹 Vaciar carrito
    btnVaciar?.addEventListener("click", () => {
        if (confirm("¿Seguro que desea vaciar el carrito?")) {
            localStorage.removeItem("carrito");
            carrito.length = 0;
            renderCarrito();
        }
    });
    // 🛒 Comprar
    btnComprar?.addEventListener("click", async () => {
        if (!user || !user.id) {
            alert("Debe iniciar sesión para realizar la compra.");
            return;
        }
        if (!carrito.length) {
            alert("El carrito está vacío.");
            return;
        }
        // 🧾 Estructura de pedido compatible con el backend
        // Build usuario object: prefer id, otherwise use email+nombre so backend can create/sync usuarios table
        let usuarioObj = null;
        if (user) {
            if (user.id) {
                usuarioObj = { id: user.id };
            }
            else if (user.email) {
                usuarioObj = { email: user.email, nombre: user.name || user.nombre || "" };
            }
        }
        if (!usuarioObj) {
            throw new Error("Usuario no autenticado o sin información suficiente. Por favor inicie sesión.");
        }
        const pedido = {
            fecha: new Date().toISOString(),
            usuario: usuarioObj,
            detalles: carrito.map((item) => ({
                cantidad: item.cantidad || 1,
                precioUnitario: item.precio,
                subtotal: (item.cantidad || 1) * item.precio,
                producto: { id: item.id }
            }))
        };
        try {
            const response = await fetch(`${API_URL}/api/pedidos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pedido)
            });
            if (!response.ok)
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            const data = await response.json();
            alert("Compra realizada con éxito!");
            localStorage.removeItem("carrito");
            carrito.length = 0;
            renderCarrito();
        }
        catch (error) {
            console.error("❌ Error al procesar la compra:", error);
            alert("Error al procesar la compra. Ver consola para más detalles.");
        }
    });
});

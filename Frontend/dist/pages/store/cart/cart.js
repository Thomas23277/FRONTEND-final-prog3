"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8080"; // URL del backend
    // 🔹 Recuperar datos del localStorage
    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    let user = JSON.parse(localStorage.getItem("foodstore_user") || "null");
    // 🔹 Referencias al DOM
    const btnComprar = document.getElementById("btnComprar");
    const btnVaciar = document.getElementById("btnVaciar");
    const contenedorCarrito = document.getElementById("carrito");
    const totalSpan = document.getElementById("total");
    // 🔄 Renderizar carrito
    function renderCarrito() {
        contenedorCarrito.innerHTML = "";
        let total = 0;
        if (carrito.length === 0) {
            contenedorCarrito.innerHTML = `<p>🛒 El carrito está vacío.</p>`;
            totalSpan.textContent = "Total: $0";
            return;
        }
        carrito.forEach((item, index) => {
            const cantidad = item.cantidad || 1;
            const subtotal = item.precio * cantidad;
            total += subtotal;
            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `
        <div class="cart-item-info">
          <h4>${item.nombre}</h4>
          <p>Precio: $${item.precio.toLocaleString()}</p>
          <p>Subtotal: $${subtotal.toLocaleString()}</p>
        </div>
        <div class="qty-controls">
          <button id="dec-${index}">-</button>
          <input type="number" id="cant-${index}" min="1" value="${cantidad}" style="width:50px;text-align:center;">
          <button id="inc-${index}">+</button>
        </div>
        <button id="del-${index}" class="remove-btn">🗑</button>
      `;
            contenedorCarrito.appendChild(div);
            // 🎛️ Control de cantidad
            const inputCantidad = div.querySelector(`#cant-${index}`);
            const btnInc = div.querySelector(`#inc-${index}`);
            const btnDec = div.querySelector(`#dec-${index}`);
            const btnEliminar = div.querySelector(`#del-${index}`);
            inputCantidad.addEventListener("change", () => {
                const nuevaCantidad = Math.max(1, parseInt(inputCantidad.value) || 1);
                carrito[index].cantidad = nuevaCantidad;
                localStorage.setItem("carrito", JSON.stringify(carrito));
                renderCarrito();
            });
            btnInc.addEventListener("click", () => {
                carrito[index].cantidad = (carrito[index].cantidad || 1) + 1;
                localStorage.setItem("carrito", JSON.stringify(carrito));
                renderCarrito();
            });
            btnDec.addEventListener("click", () => {
                carrito[index].cantidad = Math.max(1, (carrito[index].cantidad || 1) - 1);
                localStorage.setItem("carrito", JSON.stringify(carrito));
                renderCarrito();
            });
            btnEliminar.addEventListener("click", () => {
                carrito.splice(index, 1);
                localStorage.setItem("carrito", JSON.stringify(carrito));
                renderCarrito();
            });
        });
        totalSpan.textContent = `Total: $${total.toLocaleString()}`;
    }
    renderCarrito();
    // 🧹 Vaciar carrito
    btnVaciar.addEventListener("click", () => {
        if (confirm("¿Seguro que desea vaciar el carrito?")) {
            localStorage.removeItem("carrito");
            carrito.length = 0;
            renderCarrito();
        }
    });
    // 🛒 Comprar
    btnComprar.addEventListener("click", async () => {
        if (!carrito.length) {
            alert("El carrito está vacío.");
            return;
        }
        // 💡 Verificar usuario
        if (!user) {
            const nombre = prompt("Ingrese su nombre:") || "Invitado";
            const email = prompt("Ingrese su email:");
            if (!email) {
                alert("Debe ingresar un email para continuar.");
                return;
            }
            try {
                const res = await fetch(`${API_URL}/api/usuarios/login?email=${email}&nombre=${encodeURIComponent(nombre)}`, {
                    method: "POST",
                });
                if (!res.ok)
                    throw new Error("No se pudo registrar o recuperar el usuario");
                user = await res.json();
                localStorage.setItem("foodstore_user", JSON.stringify(user));
            }
            catch (err) {
                console.error("❌ Error creando usuario:", err);
                alert("Error al crear usuario.");
                return;
            }
        }
        // 🧾 Crear pedido (según tu entidad DetallePedido.java)
        const pedido = {
            fecha: new Date().toISOString(),
            usuario: { id: user.id },
            detalles: carrito.map((item) => ({
                cantidad: item.cantidad || 1,
                precioUnitario: item.precio,
                subtotal: (item.cantidad || 1) * item.precio,
                producto: { id: item.id },
            })),
        };
        try {
            const response = await fetch(`${API_URL}/api/pedidos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pedido),
            });
            if (!response.ok)
                throw new Error(`Error ${response.status}`);
            alert("✅ Compra realizada con éxito!");
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

import { apiFetch } from "../utils/apiClient.js";

interface ProductoCarrito {
  id: number;
  nombre: string;
  precio: number;
  imagen?: string;
  cantidad: number;
  stock?: number;
}

interface PedidoDetalle {
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto: { id: number };
}

interface Pedido {
  usuario: { id: number };
  detalles: PedidoDetalle[];
}

document.addEventListener("DOMContentLoaded", () => {
  const carritoContainer = document.getElementById("cart-items") as HTMLElement | null;
  const totalEl = document.getElementById("cart-total") as HTMLElement | null;
  const vaciarBtn = document.getElementById("clear-cart-btn") as HTMLButtonElement | null;
  const comprarBtn = document.getElementById("checkout-btn") as HTMLButtonElement | null;
  const mensajeEl = document.getElementById("mensaje") as HTMLElement | null;
  const cartBadge = document.getElementById("cart-badge") as HTMLElement | null;

  // 🔹 Cargar y guardar carrito
  function cargarCarrito(): ProductoCarrito[] {
    try {
      return JSON.parse(localStorage.getItem("carrito") || "[]");
    } catch {
      return [];
    }
  }

  function guardarCarrito(c: ProductoCarrito[]) {
    localStorage.setItem("carrito", JSON.stringify(c));
    actualizarBadge();
  }

  function calcularTotal(carrito: ProductoCarrito[]) {
    return carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  }

  function actualizarBadge() {
    const carrito = cargarCarrito();
    const totalItems = carrito.reduce((sum, p) => sum + p.cantidad, 0);
    if (cartBadge) {
      cartBadge.textContent = String(totalItems);
      cartBadge.style.display = totalItems > 0 ? "inline-block" : "none";
    }
  }

  function renderizarCarrito() {
    const carrito = cargarCarrito();
    if (!carritoContainer || !totalEl) return;

    carritoContainer.innerHTML = "";

    if (carrito.length === 0) {
      carritoContainer.innerHTML = `<p>🛒 Tu carrito está vacío.</p>`;
      totalEl.textContent = "$0";
      actualizarBadge();
      return;
    }

    carrito.forEach((item) => {
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <img src="${item.imagen || `https://picsum.photos/seed/${encodeURIComponent(item.nombre)}/100`}" alt="${item.nombre}">
        <div class="cart-info">
          <h4>${item.nombre}</h4>
          <p>Precio: $${item.precio.toLocaleString()}</p>
          <p>Cantidad: 
            <input type="number" min="1" max="${item.stock ?? 99}" value="${item.cantidad}" class="cantidad-input" data-id="${item.id}">
          </p>
          <button class="remove-btn" data-id="${item.id}">Eliminar</button>
        </div>
      `;
      carritoContainer.appendChild(div);
    });

    totalEl.textContent = `$${calcularTotal(carrito).toLocaleString()}`;

    // Listeners
    document.querySelectorAll<HTMLInputElement>(".cantidad-input").forEach((input) => {
      input.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        const id = Number(target.dataset.id);
        const cantidad = Math.max(1, Math.min(Number(target.value) || 1, Number(target.max || "99")));
        const carritoActualizado = cargarCarrito().map((item) =>
          item.id === id ? { ...item, cantidad } : item
        );
        guardarCarrito(carritoActualizado);
        renderizarCarrito();
      });
    });

    document.querySelectorAll<HTMLButtonElement>(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number((e.target as HTMLButtonElement).dataset.id);
        const carritoFiltrado = cargarCarrito().filter((item) => item.id !== id);
        guardarCarrito(carritoFiltrado);
        renderizarCarrito();
      });
    });

    actualizarBadge();
  }

  if (vaciarBtn) {
    vaciarBtn.addEventListener("click", () => {
      if (confirm("¿Seguro que desea vaciar el carrito?")) {
        localStorage.removeItem("carrito");
        renderizarCarrito();
      }
    });
  }

  if (comprarBtn) {
    comprarBtn.addEventListener("click", async () => {
      const carrito = cargarCarrito();
      if (!carrito.length) {
        alert("El carrito está vacío.");
        return;
      }

      const usuarioGuardado = localStorage.getItem("user") || localStorage.getItem("usuario");
      if (!usuarioGuardado) {
        const nombre = prompt("Ingrese su nombre:") || "Invitado";
        const email = prompt("Ingrese su email:");
        if (!email) {
          alert("Debe ingresar un email para continuar.");
          return;
        }

        try {
          const res = await fetch(`http://localhost:8080/api/usuarios/login?email=${encodeURIComponent(email)}&nombre=${encodeURIComponent(nombre)}`, {
            method: "POST",
          });
          if (!res.ok) throw new Error("No se pudo registrar o recuperar el usuario");
          const nuevoUsuario = await res.json();
          localStorage.setItem("user", JSON.stringify(nuevoUsuario));
        } catch (err) {
          console.error("❌ Error creando usuario:", err);
          alert("Error al crear usuario.");
          return;
        }
      }

      const usuario = JSON.parse(localStorage.getItem("user") || localStorage.getItem("usuario") || "null");
      if (!usuario || !usuario.id) {
        alert("No se pudo identificar al usuario. Inicie sesión.");
        return;
      }

      const pedido: Pedido = {
        usuario: { id: usuario.id },
        detalles: carrito.map((p) => ({
          cantidad: p.cantidad,
          precioUnitario: p.precio,
          subtotal: p.precio * p.cantidad,
          producto: { id: p.id },
        })),
      };

      try {
        const respuesta = await apiFetch("/api/pedidos", {
          method: "POST",
          body: JSON.stringify(pedido),
        });

        console.log("✅ Pedido creado:", respuesta);
        localStorage.removeItem("carrito");
        renderizarCarrito();
        if (mensajeEl) mensajeEl.textContent = "🧾 Pedido realizado con éxito.";
      } catch (error) {
        console.error("❌ Error al enviar el pedido:", error);
        if (mensajeEl) mensajeEl.textContent = "Error al procesar el pedido.";
      }
    });
  }

  renderizarCarrito();
});

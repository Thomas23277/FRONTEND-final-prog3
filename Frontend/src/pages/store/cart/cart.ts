// src/pages/store/cart/cart.ts

type Item = {
  id: number;
  nombre: string;
  precio: number;
  cantidad?: number;
};

type User = {
  id?: number;
  nombre?: string;
  email?: string;
  role?: string;
} | null;

document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:8080";

  // 🛒 Inicializar carrito
  let carrito: Item[] = [];
  try {
    const raw = localStorage.getItem("carrito");
    carrito = raw ? (JSON.parse(raw) as Item[]) : [];
  } catch {
    carrito = [];
  }

  // 👤 Inicializar usuario
  let user: User = null;
  try {
    const rawUser = localStorage.getItem("foodstore_user");
    user = rawUser ? (JSON.parse(rawUser) as User) : null;
  } catch {
    user = null;
  }

  // 🔗 Elementos del DOM
  const btnComprar = document.getElementById("btnComprar") as HTMLButtonElement | null;
  const btnVaciar = document.getElementById("btnVaciar") as HTMLButtonElement | null;
  const contenedorCarrito = document.getElementById("carrito") as HTMLElement | null;
  const totalSpan = document.getElementById("total") as HTMLElement | null;
  const cartBadge = document.getElementById("cart-badge") as HTMLElement | null;
  const backBtn = document.getElementById("back-btn") as HTMLButtonElement | null;

  if (!contenedorCarrito || !totalSpan) return;

  // 🔹 Función: actualizar badge del carrito
  function updateCartBadge(): void {
    const total = carrito.reduce((sum, i) => sum + (Number(i.cantidad) || 0), 0);
    if (cartBadge) {
      cartBadge.textContent = String(total);
      cartBadge.style.display = total > 0 ? "inline-block" : "none";
    }
  }

  // 🔹 Guardar carrito
  function saveCart(): void {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    updateCartBadge();
  }

  // 🔹 Renderizar carrito
  function renderCarrito(): void {
    if (!contenedorCarrito || !totalSpan) return;
    contenedorCarrito.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
      contenedorCarrito.innerHTML = `<p>🛒 El carrito está vacío.</p>`;
      totalSpan.textContent = "Total: $0";
      updateCartBadge();
      return;
    }

    carrito.forEach((item, index) => {
      const cantidad = item.cantidad ?? 1;
      const subtotal = item.precio * cantidad;
      total += subtotal;

      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <div class="cart-item-info">
          <h4>${escapeHtml(item.nombre)}</h4>
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

      const inputCantidad = div.querySelector(`#cant-${index}`) as HTMLInputElement | null;
      const btnInc = div.querySelector(`#inc-${index}`) as HTMLButtonElement | null;
      const btnDec = div.querySelector(`#dec-${index}`) as HTMLButtonElement | null;
      const btnEliminar = div.querySelector(`#del-${index}`) as HTMLButtonElement | null;

      inputCantidad?.addEventListener("change", () => {
        carrito[index].cantidad = Math.max(1, parseInt(inputCantidad.value) || 1);
        saveCart();
        renderCarrito();
      });

      btnInc?.addEventListener("click", () => {
        carrito[index].cantidad = (carrito[index].cantidad || 1) + 1;
        saveCart();
        renderCarrito();
      });

      btnDec?.addEventListener("click", () => {
        carrito[index].cantidad = Math.max(1, (carrito[index].cantidad || 1) - 1);
        saveCart();
        renderCarrito();
      });

      btnEliminar?.addEventListener("click", () => {
        carrito.splice(index, 1);
        saveCart();
        renderCarrito();
      });
    });

    totalSpan.textContent = `Total: $${total.toLocaleString()}`;
  }

  function escapeHtml(str: string): string {
    return str.replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[m] || m));
  }

  // 🧹 Vaciar carrito
  btnVaciar?.addEventListener("click", () => {
    if (confirm("¿Seguro que desea vaciar el carrito?")) {
      localStorage.removeItem("carrito");
      carrito = [];
      renderCarrito();
    }
  });

  // 🛒 Comprar
  btnComprar?.addEventListener("click", async () => {
    if (!carrito.length) {
      alert("El carrito está vacío.");
      return;
    }

    try {
      // ✅ Verificar usuario
      if (!user || !user.id) {
        const nombre = prompt("Ingrese su nombre:") || "Invitado";
        const email = prompt("Ingrese su email:");
        if (!email) {
          alert("Debe ingresar un email válido.");
          return;
        }

        console.log("Intentando crear o recuperar usuario...");

        // 🔹 Crear o recuperar usuario automáticamente
        const res = await fetch(`${API_URL}/api/usuarios/login?email=${encodeURIComponent(email)}&nombre=${encodeURIComponent(nombre)}`, {
          method: "POST",
        });
        const text = await res.text();

        if (!res.ok) {
          alert(`Error al obtener usuario: ${text}`);
          return;
        }

        const parsed = JSON.parse(text);
        user = parsed;
        localStorage.setItem("foodstore_user", JSON.stringify(user));
      }

      // 🧠 Verificar que exista realmente en BD
      const check = await fetch(`${API_URL}/api/usuarios/${user!.id}`);
      if (!check.ok) {
        alert("El usuario no existe en la base de datos. Reintente iniciar sesión.");
        localStorage.removeItem("foodstore_user");
        user = null;
        return;
      }

      // 🧾 Crear pedido
      const pedido = {
        fecha: new Date().toISOString(),
        usuario: { id: user!.id, email: user!.email },
        detalles: carrito.map((i) => ({
          cantidad: i.cantidad || 1,
          precioUnitario: i.precio,
          subtotal: (i.cantidad || 1) * i.precio,
          producto: { id: i.id },
        })),
      };

      console.log("➡ Enviando pedido:", pedido);

      const resPedido = await fetch(`${API_URL}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      });

      const textResp = await resPedido.text();
      console.log("⬅ Respuesta pedido:", resPedido.status, textResp);

      if (!resPedido.ok) {
        alert(`Error al procesar compra (${resPedido.status}): ${textResp}`);
        return;
      }

      alert("✅ Compra realizada con éxito!");
      localStorage.removeItem("carrito");
      carrito = [];
      renderCarrito();
      updateCartBadge();

    } catch (err) {
      console.error("Error al procesar compra:", err);
      alert("Error inesperado al procesar la compra. Revise consola.");
    }
  });

  // 🔙 Volver
  backBtn?.addEventListener("click", () => {
    if (document.referrer) history.back();
    else window.location.href = "/src/pages/store/home/home.html";
  });

  // Inicialización
  renderCarrito();
  updateCartBadge();
});

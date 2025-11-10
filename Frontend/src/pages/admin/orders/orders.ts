import { apiFetch } from "../../../utils/apiClient";

interface PedidoDetalle {
  id: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto: {
    id: number;
    nombre: string;
    imagen?: string;
  };
}

interface Pedido {
  id: number;
  fecha: string;
  total: number;
  detalles: PedidoDetalle[];
}

document.addEventListener("DOMContentLoaded", async () => {
  const ordersContainer = document.getElementById("orders-container") as HTMLElement | null;
  const mensajeEl = document.getElementById("mensaje") as HTMLElement | null;
  const usuarioData = localStorage.getItem("user") || localStorage.getItem("usuario");

  if (!ordersContainer || !mensajeEl) return;

  if (!usuarioData) {
    mensajeEl.textContent = "⚠️ Debes iniciar sesión para ver tus pedidos.";
    return;
  }

  let usuario: { id?: number };
  try {
    usuario = JSON.parse(usuarioData);
  } catch {
    mensajeEl.textContent = "⚠️ Error al leer los datos del usuario.";
    return;
  }

  if (!usuario.id) {
    mensajeEl.textContent = "⚠️ Usuario inválido o no identificado.";
    return;
  }

  try {
    // ✅ Obtiene los pedidos del usuario logueado desde la API
    const pedidos: Pedido[] = await apiFetch(`/api/pedidos/usuario/${usuario.id}`, {
      method: "GET",
    });

    if (!pedidos || pedidos.length === 0) {
      mensajeEl.textContent = "🧾 No tienes pedidos registrados aún.";
      ordersContainer.innerHTML = "";
      return;
    }

    renderizarPedidos(pedidos);
  } catch (error) {
    console.error("❌ Error al cargar pedidos:", error);
    mensajeEl.textContent = "⚠️ Error al obtener tus pedidos. Intenta más tarde.";
  }

  function renderizarPedidos(pedidos: Pedido[]) {
    if (!ordersContainer) return;
    ordersContainer.innerHTML = "";

    pedidos.forEach((pedido) => {
      const pedidoDiv = document.createElement("div");
      pedidoDiv.className = "order-card";
      pedidoDiv.innerHTML = `
        <h3>🧾 Pedido #${pedido.id}</h3>
        <p><b>Fecha:</b> ${new Date(pedido.fecha).toLocaleString()}</p>
        <p><b>Total:</b> $${pedido.total.toLocaleString()}</p>
        <div class="order-details">
          ${pedido.detalles
            .map(
              (d) => `
            <div class="order-item">
              <img src="${
                d.producto.imagen ||
                `https://picsum.photos/seed/${encodeURIComponent(d.producto.nombre)}/80`
              }" alt="${d.producto.nombre}">
              <div>
                <h4>${d.producto.nombre}</h4>
                <p>Cantidad: ${d.cantidad}</p>
                <p>Precio: $${d.precioUnitario.toLocaleString()}</p>
                <p>Subtotal: $${d.subtotal.toLocaleString()}</p>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
      ordersContainer.appendChild(pedidoDiv);
    });
  }
});

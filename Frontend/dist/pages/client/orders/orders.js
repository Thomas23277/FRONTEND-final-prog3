"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const ordersContainer = document.getElementById("orders-list");
    function formatDate(d) {
        try {
            const dt = new Date(d);
            return dt.toLocaleString();
        }
        catch {
            return d;
        }
    }
    async function loadOrders() {
        try {
            const resp = await fetch(`${API_URL}/api/pedidos`);
            if (!resp.ok)
                throw new Error("Error al obtener pedidos");
            const pedidos = await resp.json();
            if (!ordersContainer)
                return;
            ordersContainer.innerHTML = "";
            if (!Array.isArray(pedidos) || pedidos.length === 0) {
                ordersContainer.innerHTML = "<p>No hay pedidos.</p>";
                return;
            }
            pedidos.forEach((p) => {
                const card = document.createElement("div");
                card.className = "order-card";
                const detallesArr = (p.detalles || []).map((d) => `<li>${d.producto?.nombre || 'Producto #' + (d.producto?.id || '')} - Cant: ${d.cantidad} - $${d.precioUnitario}</li>`);
                const subtotal = (p.detalles || []).reduce((s, d) => s + (Number(d.subtotal || (d.cantidad * d.precioUnitario)) || 0), 0);
                card.innerHTML = `
          <h4>Pedido #${p.id} - ${formatDate(p.fecha || p.date || '')}</h4>
          <ul>${detallesArr.join('')}</ul>
          <p><b>Total: $${subtotal.toLocaleString()}</b></p>
        `;
                ordersContainer.appendChild(card);
            });
        }
        catch (err) {
            console.error("Error cargando pedidos:", err);
            if (ordersContainer)
                ordersContainer.innerHTML = "<p>Error al cargar pedidos.</p>";
        }
    }
    loadOrders();
});

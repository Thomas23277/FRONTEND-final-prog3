document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cart-items") as HTMLElement;
  const cartTotalEl = document.getElementById("cart-total") as HTMLElement;
  const clearCartBtn = document.getElementById("clear-cart-btn") as HTMLButtonElement | null;
  const checkoutBtn = document.getElementById("checkout-btn") as HTMLButtonElement | null;
  const backBtn = document.getElementById("back-btn") as HTMLButtonElement | null;

  function loadCartFromStorage() {
    try {
      return JSON.parse(localStorage.getItem("carrito") || "[]");
    } catch {
      return [];
    }
  }

  function saveCartToStorage(cart: any[]) {
    localStorage.setItem("carrito", JSON.stringify(cart));
  }

  function renderCart() {
    const carrito = loadCartFromStorage();
    cartItemsContainer.innerHTML = "";

    if (carrito.length === 0) {
      cartItemsContainer.innerHTML = "<p>🛍️ Tu carrito está vacío.</p>";
      cartTotalEl.textContent = "Total: $0";

      // ocultar botones si está vacío
      if (clearCartBtn) clearCartBtn.style.display = "none";
      if (checkoutBtn) checkoutBtn.style.display = "none";
      return;
    }

    // mostrar botones
    if (clearCartBtn) clearCartBtn.style.display = "inline-block";
    if (checkoutBtn) checkoutBtn.style.display = "inline-block";

    let total = 0;
    carrito.forEach((item: any, index: number) => {
      const itemEl = document.createElement("div");
      itemEl.className = "cart-item";
      itemEl.innerHTML = `
        <div class="item-info">
          <strong>${item.nombre}</strong> - $${item.precio.toLocaleString()}
          <br />
          <label>Cantidad:</label>
          <input type="number" min="1" value="${item.cantidad}" class="qty-input" data-index="${index}">
        </div>
        <button class="remove-btn" data-index="${index}">❌</button>
      `;
      cartItemsContainer.appendChild(itemEl);
      total += item.precio * item.cantidad;
    });

    cartTotalEl.textContent = `Total: $${total.toLocaleString()}`;

    // Eventos para eliminar productos individuales
    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt((e.target as HTMLElement).getAttribute("data-index") || "0");
        const cart = loadCartFromStorage();
        cart.splice(index, 1);
        saveCartToStorage(cart);
        renderCart();
      });
    });

    // Actualizar cantidad
    document.querySelectorAll(".qty-input").forEach((input) => {
      input.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        const index = parseInt(target.getAttribute("data-index") || "0");
        const newQty = Math.max(1, parseInt(target.value) || 1);
        const cart = loadCartFromStorage();
        cart[index].cantidad = newQty;
        saveCartToStorage(cart);
        renderCart();
      });
    });
  }

  // Vaciar carrito
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      localStorage.removeItem("carrito");
      renderCart();
    });
  }

  // Comprar (ficticio)
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      alert("🛍️ Simulación de compra. ¡Gracias por elegirnos!");
    });
  }

  // Volver al home
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "/src/pages/store/home/home.html";
    });
  }

  // Render inicial
  renderCart();
});

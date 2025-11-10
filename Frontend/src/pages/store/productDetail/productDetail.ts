document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  // 🧩 Selección de elementos con tipos explícitos
  const imgEl = document.getElementById("product-img") as HTMLImageElement | null;
  const nameEl = document.getElementById("product-name") as HTMLElement | null;
  const descEl = document.getElementById("product-desc") as HTMLElement | null;
  const priceEl = document.getElementById("product-price") as HTMLElement | null;
  const statusEl = document.getElementById("product-status") as HTMLElement | null;
  const quantityEl = document.getElementById("quantity") as HTMLInputElement | null;
  const addBtn = document.getElementById("add-to-cart-btn") as HTMLButtonElement | null;
  const messageEl = document.getElementById("message") as HTMLElement | null;
  const backBtn = document.getElementById("back-btn") as HTMLButtonElement | null;
  const cartBadge = document.getElementById("cart-badge") as HTMLElement | null;

  // 🔙 Botón "Volver"
  if (backBtn) backBtn.addEventListener("click", () => window.history.back());

  // 🛒 Funciones del carrito
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem("carrito") || "[]");
    } catch {
      return [];
    }
  }

  function saveCart(c: any[]) {
    localStorage.setItem("carrito", JSON.stringify(c));
    updateBadge(); // 🔹 Actualiza el contador cada vez que se guarda el carrito
  }

  function updateBadge() {
    if (!cartBadge) return;
    const c = loadCart();
    const t = c.reduce((s: number, i: any) => s + (Number(i.cantidad) || 0), 0);
    cartBadge.textContent = String(t);
    cartBadge.style.display = t > 0 ? "inline-block" : "none";
  }

  // 🔹 Sincroniza el contador si cambia el carrito en otra pestaña
  window.addEventListener("storage", (e) => {
    if (e.key === "carrito") updateBadge();
  });

  // 🚫 Si no hay ID, mostramos mensaje
  if (!id) {
    if (messageEl) messageEl.textContent = "Producto no encontrado";
    return;
  }

  try {
    const r = await fetch(`http://localhost:8080/api/producto/${id}`);
    if (!r.ok) throw new Error("no product");
    const product = await r.json();
    const stock = Number(product.stock) || 0;

    if (imgEl)
      imgEl.src =
        product.imagen ||
        `https://picsum.photos/seed/${encodeURIComponent(product.nombre)}/400/300`;
    if (nameEl) nameEl.textContent = product.nombre;
    if (descEl) descEl.textContent = product.descripcion || "";
    if (priceEl) priceEl.textContent = `$${product.precio.toLocaleString()}`;

    if (statusEl && addBtn) {
      if (stock > 0) {
        statusEl.textContent = `Disponible (${stock} unidades)`;
        statusEl.classList.add("available");
      } else {
        statusEl.textContent = "Sin stock";
        statusEl.classList.add("unavailable");
        addBtn.disabled = true;
      }
    }

    // 🧃 Agregar al carrito
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        if (!quantityEl || !messageEl) return;

        const cantidad = Math.max(1, Number(quantityEl.value) || 1);
        if (cantidad > stock) {
          messageEl.textContent = `No hay suficiente stock. Disponible: ${stock}`;
          return;
        }

        const cart = loadCart();
        const existing = cart.find((it: any) => it.id === product.id);

        if (existing) {
          if (existing.cantidad + cantidad > stock) {
            messageEl.textContent = `Stock insuficiente. Solo quedan ${stock}`;
            return;
          }
          existing.cantidad += cantidad;
        } else {
          cart.push({
            id: product.id,
            nombre: product.nombre,
            precio: product.precio,
            imagen: product.imagen,
            cantidad,
            stock,
          });
        }

        saveCart(cart);
        messageEl.textContent = "✅ Producto agregado al carrito.";
        quantityEl.value = "1";
      });
    }

    updateBadge();
  } catch (e) {
    console.error(e);
    if (messageEl) messageEl.textContent = "Error al cargar producto";
  }
});

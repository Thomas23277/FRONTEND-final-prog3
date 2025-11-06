document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("back-btn") as HTMLButtonElement;
  const nameEl = document.getElementById("product-name") as HTMLElement;
  const descEl = document.getElementById("product-desc") as HTMLElement;
  const priceEl = document.getElementById("product-price") as HTMLElement;
  const imgEl = document.getElementById("product-img") as HTMLImageElement;
  const statusEl = document.getElementById("product-status") as HTMLElement;
  const quantityInput = document.getElementById("quantity") as HTMLInputElement;
  const addBtn = document.getElementById("add-to-cart-btn") as HTMLButtonElement;
  const messageEl = document.getElementById("message") as HTMLElement;

  // 🔙 Volver al Home
  backBtn.addEventListener("click", () => {
    window.location.href = "/src/pages/store/home/home.html";
  });

  // 🧾 Obtener producto seleccionado
  const productoSeleccionado = JSON.parse(localStorage.getItem("productoSeleccionado") || "null");

  if (!productoSeleccionado) {
    document.querySelector(".product-container")!.innerHTML = "<p>Error al cargar el producto.</p>";
    return;
  }

  // 📦 Mostrar datos del producto
  nameEl.textContent = productoSeleccionado.nombre;
  descEl.textContent = productoSeleccionado.descripcion;
  priceEl.textContent = `$${productoSeleccionado.precio.toLocaleString()}`;
  statusEl.textContent = productoSeleccionado.disponible ? "Disponible" : "Sin stock";
  statusEl.className = `badge ${productoSeleccionado.disponible ? "available" : "unavailable"}`;
  imgEl.src = `https://picsum.photos/seed/${encodeURIComponent(productoSeleccionado.nombre)}/600/400`;

  // 🛒 Agregar al carrito
  addBtn.addEventListener("click", () => {
    const cantidad = parseInt(quantityInput.value);

    if (!productoSeleccionado.disponible) {
      messageEl.textContent = "⚠️ Este producto no está disponible.";
      messageEl.style.color = "red";
      return;
    }

    if (cantidad < 1) {
      messageEl.textContent = "❗ Ingresa una cantidad válida.";
      messageEl.style.color = "red";
      return;
    }

    // --- Guardar en carrito ---
    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    const existente = carrito.find((item: any) => item.id === productoSeleccionado.id);

    if (existente) {
      existente.cantidad += cantidad;
    } else {
      carrito.push({ ...productoSeleccionado, cantidad });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

    messageEl.textContent = "✅ Producto agregado al carrito.";
    messageEl.style.color = "green";

    // 🔄 Redirigir al home después de 1.5s
    setTimeout(() => {
      window.location.href = "/src/pages/store/home/home.html";
    }, 1500);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menu-btn") as HTMLButtonElement;
  const sidebar = document.getElementById("sidebar") as HTMLElement;
  const logoutBtn = document.getElementById("logout-sidebar") as HTMLButtonElement;
  const searchInput = document.getElementById("search-input-top") as HTMLInputElement;
  const searchBtn = document.getElementById("search-btn-top") as HTMLButtonElement;
  const categorySelect = document.getElementById("category-filter-side") as HTMLSelectElement;
  const sortSelect = document.getElementById("sort-side") as HTMLSelectElement;
  const productListEl = document.getElementById("product-list") as HTMLElement;
  const productCountEl = document.getElementById("product-count") as HTMLElement;
  const userInfo = document.getElementById("user-info") as HTMLElement;
  const cartBtn = document.getElementById("cart-button") as HTMLButtonElement;
  const cartBadge = document.getElementById("cart-badge") as HTMLElement;

  let productos: any[] = [];
  let productosFiltrados: any[] = [];

  /* 🛒 --- Funciones de carrito --- */
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

  function updateCartBadge() {
    const cart = loadCartFromStorage();
    const total = cart.reduce((sum: number, it: any) => sum + (Number(it.cantidad) || 0), 0);
    if (cartBadge) {
      cartBadge.textContent = String(total);
      cartBadge.style.display = total > 0 ? "inline-block" : "none";
    }
  }

  // 🛒 Redirigir al carrito
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      window.location.href = "/src/pages/store/cart/cart.html";
    });
  }

  // 🧑‍💻 Mostrar nombre de usuario
  const usuarioData = localStorage.getItem("user") || localStorage.getItem("usuario");
  let usuarioNombre = "Invitado";

  if (usuarioData) {
    try {
      const usuario = JSON.parse(usuarioData);
      usuarioNombre = usuario.name || usuario.nombre || usuario.username || usuario.email || "Invitado";
    } catch {
      usuarioNombre = usuarioData;
    }
  }

  if (userInfo) userInfo.textContent = `👋 Hola, ${usuarioNombre}`;

  // 🧭 Sidebar toggle
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  // 🚪 Cerrar sesión
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("usuario");
    window.location.href = "/src/pages/auth/login/login.html";
  });

  // 🛍️ Cargar productos
  async function cargarProductos() {
    try {
      const resp = await fetch("http://localhost:8080/api/producto");
      if (!resp.ok) throw new Error("Error al obtener productos desde backend");

      productos = await resp.json();
      if (!Array.isArray(productos)) throw new Error("Formato inválido");

      console.log("✅ Productos cargados desde backend:", productos);
    } catch (err) {
      console.warn("⚠️ Servidor no disponible o respuesta inválida. Usando datos locales.", err);
      productos = [
        { id: 1, nombre: "Agua mineral", descripcion: "Botella 2L", precio: 2500, categoria: { id: 1, nombre: "Bebidas" }, stock: 10 },
        { id: 2, nombre: "Doritos", descripcion: "Snacks de maíz", precio: 3000, categoria: { id: 2, nombre: "Snacks" }, stock: 5 },
        { id: 3, nombre: "Banana", descripcion: "1kg", precio: 800, categoria: { id: 3, nombre: "Frutas y Verduras" }, stock: 20 },
      ];
    }

    productosFiltrados = [...productos];
    renderProductos(productosFiltrados);
    cargarCategorias();
  }

  // 🧱 Render productos
  function renderProductos(lista: any[]) {
    if (!productListEl) return;
    productListEl.innerHTML = "";

    if (productCountEl) {
      productCountEl.textContent = `${lista.length} producto${lista.length !== 1 ? "s" : ""}`;
    }

    if (lista.length === 0) {
      productListEl.innerHTML = `<p>No se encontraron productos.</p>`;
      return;
    }

    lista.forEach((p) => {
      const card = document.createElement("div");
      card.className = "product-card";
      const imgSrc = `https://picsum.photos/seed/${encodeURIComponent(p.nombre)}/300/200`;

      card.innerHTML = `
        <div class="img-container">
          <img src="${imgSrc}" alt="${p.nombre}" />
          <span class="badge ${p.stock > 0 ? "available" : "unavailable"}">
            ${p.stock > 0 ? "Disponible" : "Sin stock"}
          </span>
        </div>
        <h4>${p.nombre}</h4>
        <p>${p.descripcion || ""}</p>
        <p><b>$${p.precio.toLocaleString()}</b></p>
      `;

      card.addEventListener("click", () => {
        localStorage.setItem("productoSeleccionado", JSON.stringify(p));
        window.location.href = `/src/pages/store/productDetail/productDetail.html?id=${p.id}`;
      });

      productListEl.appendChild(card);
    });
  }

  // 🧩 Cargar categorías
  function cargarCategorias() {
    const categorias = [
      { id: 1, nombre: "Bebidas" },
      { id: 2, nombre: "Snacks" },
      { id: 3, nombre: "Frutas y Verduras" },
      { id: 4, nombre: "Carnes y Pescados" },
      { id: 5, nombre: "Comidas preparadas" },
    ];

    if (!categorySelect) return;
    categorySelect.innerHTML = `<option value="">Todas</option>`;
    categorias.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.id.toString();
      option.textContent = c.nombre;
      categorySelect.appendChild(option);
    });
  }

  // 🔍 Filtros
  function buscarProductos() {
    const query = searchInput.value.toLowerCase();
    const filtrados = productos.filter((p) => p.nombre.toLowerCase().includes(query));
    renderProductos(filtrados);
  }

  searchBtn.addEventListener("click", buscarProductos);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") buscarProductos();
  });

  categorySelect.addEventListener("change", () => {
    const cat = categorySelect.value;
    if (!cat) renderProductos(productos);
    else renderProductos(productos.filter((p) => p.categoria && p.categoria.id == cat));
  });

  sortSelect.addEventListener("change", () => {
    let sorted = [...productosFiltrados];
    const val = sortSelect.value;
    if (val === "name-asc") sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (val === "name-desc") sorted.sort((a, b) => b.nombre.localeCompare(a.nombre));
    if (val === "price-asc") sorted.sort((a, b) => a.precio - b.precio);
    if (val === "price-desc") sorted.sort((a, b) => b.precio - a.precio);
    renderProductos(sorted);
  });

  // 🚀 Init
  cargarProductos();
  updateCartBadge();
});

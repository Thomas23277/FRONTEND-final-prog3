document.addEventListener("DOMContentLoaded", () => {
  const usuarioGuardado =
    localStorage.getItem("foodstore_user") ||
    localStorage.getItem("user") ||
    localStorage.getItem("usuario");

  if (!usuarioGuardado) localStorage.removeItem("carrito");

  // 🔹 Elementos del DOM
  const menuBtn = document.getElementById("menu-btn") as HTMLButtonElement | null;
  const sidebar = document.getElementById("sidebar") as HTMLElement | null;
  const logoutBtn = document.getElementById("logout-sidebar") as HTMLButtonElement | null;
  const productListEl = document.getElementById("product-list") as HTMLElement | null;
  const productCountEl = document.getElementById("product-count") as HTMLElement | null;
  const userInfo = document.getElementById("user-info") as HTMLElement | null;
  const cartBtn = document.getElementById("cart-button") as HTMLButtonElement | null;
  const cartBadge = document.getElementById("cart-badge") as HTMLElement | null;

  // 🔹 Filtros
  const searchInput = document.getElementById("search-input-top") as HTMLInputElement | null;
  const categorySelect = document.getElementById("category-filter-side") as HTMLSelectElement | null;
  const sortSelect = document.getElementById("sort-side") as HTMLSelectElement | null;

  const API_URL = "http://localhost:8080";

  let productos: any[] = [];
  let productosFiltrados: any[] = [];

  // 🛒 Carrito
  function loadCart(): any[] {
    try { return JSON.parse(localStorage.getItem("carrito") || "[]"); }
    catch { return []; }
  }

  function saveCart(cart: any[]) {
    localStorage.setItem("carrito", JSON.stringify(cart));
    updateCartBadge();
  }

  function updateCartBadge() {
    const cart = loadCart();
    const total = cart.reduce((sum, i) => sum + (Number(i.cantidad) || 0), 0);
    if (cartBadge) {
      cartBadge.textContent = String(total);
      cartBadge.style.display = total > 0 ? "inline-block" : "none";
    }
  }

  // 🔄 Sincronizar badge entre pestañas
  window.addEventListener("storage", (e) => {
    if (e.key === "carrito") updateCartBadge();
  });

  // 🛍 Ir al carrito
  cartBtn?.addEventListener("click", () => {
    window.location.href = "/src/pages/store/cart/cart.html";
  });

  // 👤 Mostrar nombre corregido
  let usuarioNombre = "Invitado";

  if (usuarioGuardado) {
    try {
      const usuario = JSON.parse(usuarioGuardado);
      if (usuario && typeof usuario === "object") {
        usuarioNombre =
          usuario.nombre?.trim() ||
          usuario.name?.trim() ||
          usuario.username?.trim() ||
          usuario.user?.nombre?.trim() ||
          usuario.user?.name?.trim() ||
          (typeof usuario.email === "string" ? usuario.email.split("@")[0] : "") ||
          "Invitado";
      }
    } catch {
      usuarioNombre = usuarioGuardado;
    }
  }

  usuarioNombre =
    usuarioNombre.charAt(0).toUpperCase() + usuarioNombre.slice(1).toLowerCase();

  if (userInfo) userInfo.textContent = `👋 Hola, ${usuarioNombre}`;

  // 📱 Menú lateral
  menuBtn?.addEventListener("click", () => {
    if (!sidebar) return;
    sidebar.classList.toggle("active");
  });

  // 🚪 Cerrar sesión
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("foodstore_user");
    localStorage.removeItem("user");
    localStorage.removeItem("usuario");
    localStorage.removeItem("carrito");
    localStorage.removeItem("productoSeleccionado");
    window.location.href = "/src/pages/auth/login/login.html";
  });

  // 📦 Cargar productos
  async function cargarProductos() {
    try {
      const r = await fetch(`${API_URL}/api/producto`);
      if (!r.ok) throw new Error("No se pudieron cargar los productos");
      productos = await r.json();
    } catch (e) {
      console.warn("⚠️ Usando productos de ejemplo:", e);
      productos = [
        { id: 1, nombre: "Agua", descripcion: "Botella 2L", precio: 2500, stock: 10, categoria: "Bebidas" },
        { id: 2, nombre: "Doritos", descripcion: "Snack", precio: 3000, stock: 5, categoria: "Snacks" },
        { id: 3, nombre: "Coca Cola 1L", descripcion: "Refresco", precio: 1500, stock: 12, categoria: "Bebidas" },
      ];
    }
    productosFiltrados = [...productos];
    renderProductos(productosFiltrados);
    cargarCategorias();
  }

  // 📂 Cargar categorías
  function cargarCategorias() {
    if (!categorySelect) return;

    const categorias = Array.from(
      new Set(
        productos.map((p) => {
          if (!p.categoria) return "Sin categoría";
          if (typeof p.categoria === "object") return p.categoria.nombre || "Sin categoría";
          return p.categoria;
        })
      )
    );

    categorySelect.innerHTML = `<option value="">Todas</option>`;
    categorias.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categorySelect.appendChild(opt);
    });
  }

  // 🔍 Buscar productos
  searchInput?.addEventListener("input", (e) => {
    const texto = (e.target as HTMLInputElement).value.toLowerCase();
    filtrarProductos(texto, categorySelect?.value || "", sortSelect?.value || "");
  });

  // 📊 Filtro por categoría
  categorySelect?.addEventListener("change", () => {
    filtrarProductos(searchInput?.value || "", categorySelect.value, sortSelect?.value || "");
  });

  // 🔃 Ordenar productos
  sortSelect?.addEventListener("change", () => {
    filtrarProductos(searchInput?.value || "", categorySelect?.value || "", sortSelect.value);
  });

  // 🧩 Filtrar + ordenar
  function filtrarProductos(busqueda: string, categoria: string, orden: string) {
    productosFiltrados = productos.filter((p) => {
      const matchTexto =
        p.nombre.toLowerCase().includes(busqueda) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(busqueda));

      const catNombre =
        typeof p.categoria === "object" ? p.categoria.nombre : p.categoria;

      const matchCategoria = categoria ? catNombre === categoria : true;
      return matchTexto && matchCategoria;
    });

    switch (orden) {
      case "name-asc": productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
      case "name-desc": productosFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre)); break;
      case "price-asc": productosFiltrados.sort((a, b) => a.precio - b.precio); break;
      case "price-desc": productosFiltrados.sort((a, b) => b.precio - a.precio); break;
    }

    renderProductos(productosFiltrados);
  }

  // 🧃 Renderizar tarjetas
  function renderProductos(lista: any[]) {
    if (!productListEl) return;
    productListEl.innerHTML = "";

    if (productCountEl)
      productCountEl.textContent = `${lista.length} producto${lista.length !== 1 ? "s" : ""}`;

    lista.forEach((p) => {
      const card = document.createElement("div");
      card.className = "product-card";
      const img = p.imagen || `https://picsum.photos/seed/${encodeURIComponent(p.nombre)}/300/200`;

      card.innerHTML = `
        <div class="img-container">
          <img src="${img}" alt="${p.nombre}"/>
          <span class="badge ${p.stock > 0 ? "available" : "unavailable"}">
            ${p.stock > 0 ? "Disponible" : "Sin stock"}
          </span>
        </div>
        <h4>${p.nombre}</h4>
        <p>${p.descripcion || ""}</p>
        <p><b>$${p.precio.toLocaleString()}</b></p>
        <button class="add-cart-btn" ${p.stock <= 0 ? "disabled" : ""}>🛒 Agregar</button>
      `;

      // 🛒 Agregar al carrito
      card.querySelector(".add-cart-btn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        const carrito = loadCart();
        const existente = carrito.find((i) => i.id === p.id);
        if (existente) existente.cantidad += 1;
        else carrito.push({ ...p, cantidad: 1 });
        saveCart(carrito);
        alert(`${p.nombre} agregado al carrito 🛒`);
      });

      // 🔗 Detalle
      card.addEventListener("click", () => {
        localStorage.setItem("productoSeleccionado", JSON.stringify(p));
        window.location.href = `/src/pages/store/productDetail/productDetail.html?id=${p.id}`;
      });

      productListEl.appendChild(card);
    });
  }

  // 🚀 Inicializar
  cargarProductos();
  updateCartBadge();
});

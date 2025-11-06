import "./styles.css";
import { getCurrentUser } from "./utils/auth";

// ======================
// 🔐 Verificación de sesión y redirección
// ======================
(function checkRootRedirect() {
  const user = getCurrentUser();
  const currentPath = window.location.pathname;

  const loginPath = "/src/pages/auth/login/login.html";
  const adminPath = "/src/pages/admin/adminHome/adminHome.html";
  const storePath = "/src/pages/store/home/home.html";

  console.log("--- Redireccionamiento de Ruta ---");
  console.log(`👤 Usuario detectado: ${user ? user.role : "ninguno"}`);
  console.log(`📄 Ruta actual: ${currentPath}`);
  console.log("---------------------------------");

  // ⚠️ Si estás en la raíz o index.html, no redirigir
  if (currentPath === "/" || currentPath.endsWith("index.html")) {
    console.log("🔹 En raíz o index.html — no se realiza redirección.");
    return;
  }

  // Si NO hay usuario logueado
  if (!user) {
    if (
      !currentPath.includes("/auth/login/") &&
      !currentPath.includes("/auth/register/")
    ) {
      console.log(`⚠️ No autenticado. Redirigiendo a login: ${loginPath}`);
      window.location.href = loginPath;
    } else {
      console.log("✅ Página pública (login/register). Acceso permitido.");
    }
    return;
  }

  // Si hay usuario logueado
  if (user.role === "admin") {
    // Solo puede acceder a rutas de admin
    if (!currentPath.includes("/admin/")) {
      console.log(`👑 Admin detectado. Redirigiendo a Admin Home.`);
      window.location.href = adminPath;
    } else {
      console.log("✅ Admin en página válida.");
    }
  } else {
    // Usuario regular
    if (!currentPath.includes("/store/")) {
      console.log(`🛒 Usuario regular. Redirigiendo a Store Home.`);
      window.location.href = storePath;
    } else {
      console.log("✅ Usuario regular en página válida.");
    }
  }
})();

// ======================
// ⚙️ Carga dinámica de scripts según la página actual (compatible con Vite)
// ======================
const path = window.location.pathname;

// --- Mapeo de todos los módulos disponibles ---
const modules = import.meta.glob([
  "./pages/auth/login/login.ts",
  "./pages/auth/register/register.ts",
  "./pages/store/home/home.ts",
  "./pages/store/productDetail/productDetail.ts",
  "./pages/store/cart/cart.ts",
  "./pages/admin/adminHome/adminHome.ts",
  "./pages/admin/categories/categories.ts",
  "./pages/admin/products/products.ts",
  "./pages/admin/orders/orders.ts",
]);


// --- Buscar el módulo correspondiente según la ruta actual ---
for (const filePath in modules) {
  const normalizedPath = filePath.replace("./pages", "/src/pages");

  if (path.includes(normalizedPath)) {
    console.log(`✅ Cargando módulo dinámico: ${filePath}`);
    // Importar dinámicamente el módulo
    import(/* @vite-ignore */ filePath);
    break;
  }
}

console.log("⚙️ Scripts dinámicos cargados según la página actual");

import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getHtmlEntries() {
  const baseDir = resolve(__dirname, "src/pages");
  const entries: Record<string, string> = {};

  function scan(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = resolve(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (file.endsWith(".html")) {
        const parts = fullPath.split("src/");
        if (parts.length > 1) {
          const relative = parts[1].replace(/\\/g, "/");
          entries[relative] = fullPath;
        }
      }
    }
  }

  scan(baseDir);
  return entries;
}

function ServeHtmlPlugin(): Plugin {
  return {
    name: "serve-html-plugin",
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url && req.url.endsWith(".html") && req.url.startsWith("/src/pages/")) {
          const filePath = resolve(__dirname, "." + req.url);
          if (fs.existsSync(filePath)) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.end(fs.readFileSync(filePath));
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  root: ".",
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        ...getHtmlEntries(),
      },
    },
    outDir: "dist",
  },
  server: {
    port: 5173,
    open: "/src/pages/auth/login/login.html",
    fs: {
      allow: [
        resolve(__dirname, "src"),
        resolve(__dirname),
      ],
    },
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [ServeHtmlPlugin()],
});

import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type App = Hono<{ Bindings: HttpBindings }>;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function serveStaticFiles(app: App) {
  // Try multiple possible paths for dist/public
  const possiblePaths = [
    path.resolve(__dirname, "../../dist/public"),      // /app/api/lib/../dist/public
    path.resolve(__dirname, "../dist/public"),         // /app/api/dist/public
    path.resolve(__dirname, "../../../dist/public"),   // fallback
    path.resolve(process.cwd(), "dist/public"),        // /app/dist/public
    "/app/dist/public",
  ];

  let distPath = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      distPath = p;
      break;
    }
  }

  if (!distPath) {
    console.error("[vite.ts] Could not find dist/public directory!");
    console.error("[vite.ts] Checked paths:", possiblePaths);
    return;
  }

  console.log(`[vite.ts] Serving static files from: ${distPath}`);

  app.use("*", serveStatic({ root: distPath }));

  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      return c.json({ error: "index.html not found" }, 500);
    }
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}

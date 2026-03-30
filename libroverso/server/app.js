import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import http from "http";
import https from "https";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dist/ de Vite (libroverso/dist)
const distPath = path.resolve(__dirname, "..", "dist");

// Estáticos + permitir .well-known (para renovaciones/manual, etc.)
app.use(express.static(distPath, { dotfiles: "allow" }));

// SPA fallback (cualquier ruta -> index.html)
app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// HTTP :80
http.createServer(app).listen(80, () => {
  console.log("HTTP listening on :80");
});

// HTTPS :443
https
  .createServer(
    {
      key: fs.readFileSync("/etc/letsencrypt/live/libroverso.me/privkey.pem"),
      cert: fs.readFileSync("/etc/letsencrypt/live/libroverso.me/fullchain.pem"),
    },
    app
  )
  .listen(443, () => {
    console.log("HTTPS listening on :443");
  });

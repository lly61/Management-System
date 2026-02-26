import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

// Routes
import authRoutes from "./server/routes/auth";
import inventoryRoutes from "./server/routes/inventory";
import orderRoutes from "./server/routes/orders";
import productionRoutes from "./server/routes/production";
import qualityRoutes from "./server/routes/quality";
import reportRoutes from "./server/routes/reports";

import { fileURLToPath } from "url";

// 获取当前文件的目录路径（ES Module 方式）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Database Connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/autoparts_db";

// We attempt to connect, but don't block server startup if it fails (so frontend can still be served)
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.log(
      'Server continuing in "Offline/Mock" mode (API calls will fail, frontend should handle this)'
    );
  });

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/quality", qualityRoutes);
app.use("/api/reports", reportRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", dbState: mongoose.connection.readyState });
});

async function startServer() {
  // Vite Middleware (for development)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

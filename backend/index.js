import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import path from "path";

import { connectDB } from "./database/db.js";

import userRoutes from "./routes/userRoutes.js";
import songRoutes from "./routes/songRoutes.js";
import albumRoutes from "./routes/albumRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const uploadsDir = path.join(process.cwd(), "uploads");
const frontendDistPath = path.resolve(process.cwd(), "../frontend/dist");

connectDB();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Spotify Clone Backend Running...",
  });
});

app.use("/api/users", userRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/payment", paymentRoutes);

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res.status(200).send("Spotify Clone Backend Running...");
  });
}

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});
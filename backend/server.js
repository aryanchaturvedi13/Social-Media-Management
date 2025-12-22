// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./src/routes/auth.js";
import postRoutes from "./src/routes/posts.js";
import userRoutes from "./src/routes/users.js";
import { authOptional } from "./src/middleware/auth.js";
import { addClient, removeClient } from "./src/realtime/hub.js";
import messageRoutes from "./src/routes/messages.js";

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

const corsCfg = {
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"], // case-insensitive
};

app.use(cors(corsCfg));
// 👇 Express v5: don't use "*". Use a regex to catch all paths.
app.options(/.*/, cors(corsCfg));

app.use(express.json());

// make req.user available before routes
app.use(authOptional);

// 👇 SSE endpoint
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // flush headers
  res.flushHeaders?.();

  // Optional: send initial event
  res.write(`event: connected\ndata: {}\n\n`);

  addClient(res);

  req.on("close", () => {
    removeClient(res);
  });
});

// routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);

// health
app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

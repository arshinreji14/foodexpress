const express = require("express");
const cors = require("cors");
const menuRoutes = require("./routes/menu.routes");
const orderRoutes = require("./routes/order.routes");
const authRoutes = require("./routes/auth.routes");
const { errorHandler } = require("./middleware/errorHandler");

function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
  app.use(express.json());

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  app.use("/api/auth", authRoutes);
  app.use("/api/menu", menuRoutes);
  app.use("/api/orders", orderRoutes);

  app.use((req, res) => res.status(404).json({ error: "Not found" }));
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

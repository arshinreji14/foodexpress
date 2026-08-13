require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const createApp = require("./app");
const { initSockets } = require("./sockets");

const PORT = process.env.PORT || 4000;

const app = createApp();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_ORIGIN || "*" },
});

app.set("io", io);
initSockets(io);

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

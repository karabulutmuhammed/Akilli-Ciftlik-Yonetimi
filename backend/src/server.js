require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { sequelize } = require("./models");
const { setIO } = require("./utils/socket");

const PORT = Number(process.env.PORT || 4000);
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

setIO(io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
});

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Server start error:", error);
  }
}

start();

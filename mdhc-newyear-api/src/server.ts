import http from "http";
import { Server as IOServer } from "socket.io";
import app from "./app";
import { initSocket } from "./utils/broadcast";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// socket.io
const io = new IOServer(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
initSocket(io);

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

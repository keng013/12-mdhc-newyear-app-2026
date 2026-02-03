import { Server } from "socket.io";

let io: Server;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: { origin: "*" }
  });
  console.log("🔥 Socket.IO initialized");
  return io;
}

export function broadcast(event: string, data: any) {
  if (!io) {
    console.warn("⚠ Socket not initialized yet.");
    return;
  }
  io.emit(event, data);
}

export function getIO() {
  if (!io) throw new Error("Socket not initialized");
  return io;
}

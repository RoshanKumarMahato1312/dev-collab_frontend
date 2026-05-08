import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;
let socketToken: string | null = null;

export const getSocket = (token: string): Socket => {
  if (socket && socketToken === token) {
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socketToken = token;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "https://dev-collab-backend-3.onrender.com", {
    auth: { token }
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
  }
  socket = null;
  socketToken = null;
};

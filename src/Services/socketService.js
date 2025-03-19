import io from "socket.io-client";

let socket;

export const initializeSocket = (userData) => {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

  // Close any existing connection
  if (socket) {
    socket.disconnect();
  }

  // Create new connection
  socket = io(API_URL);

  socket.on("connect", () => {
    console.log("Socket connected");

    // Register with socket server
    socket.emit("register", userData);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export const isSocketConnected = () => {
  return socket?.connected || false;
};

export const onPrivateMessage = (callback) => {
  if (!socket) return;
  socket.on("private-message", callback);
};

export const onBranchMessage = (callback) => {
  if (!socket) return;
  socket.on("branch-message", callback);
};

export const onShopMessage = (callback) => {
  if (!socket) return;
  socket.on("shop-message", callback);
};

export const sendPrivateMessage = (message) => {
  if (!socket) return;
  socket.emit("private-message", message);
};

export const sendBranchMessage = (message) => {
  if (!socket) return;
  socket.emit("branch-message", message);
};

export const sendShopMessage = (message) => {
  if (!socket) return;
  socket.emit("shop-message", message);
};

export const onMessageStatus = (callback) => {
  if (!socket) return;
  socket.on("message-status", callback);
};

export const onOrderStatusChange = (callback) => {
  if (!socket) return;
  socket.on("order-notification", callback);
};

export const onInventoryAlert = (callback) => {
  if (!socket) return;
  socket.on("inventory-notification", callback);
};

export const onEmergencyAlert = (callback) => {
  if (!socket) return;
  socket.on("emergency-notification", callback);
};

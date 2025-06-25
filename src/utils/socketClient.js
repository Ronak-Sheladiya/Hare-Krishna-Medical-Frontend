// src/utils/socketClient.js
let io = null;
let socketAvailable = false;

const createMockSocket = () => ({
  on: (event, callback) => {
    console.debug(`Mock socket: Registered listener for ${event}`);
    return this;
  },
  off: (event) => {
    console.debug(`Mock socket: Removed listener for ${event}`);
    return this;
  },
  emit: (event, data) => {
    console.debug(`Mock socket: Emitting ${event}`, data);
    return this;
  },
  connect: () => {
    console.debug("Mock socket: Connected");
    return this;
  },
  disconnect: () => {
    console.debug("Mock socket: Disconnected");
    return this;
  },
  connected: false,
  id: "mock-socket-" + Date.now(),
});

if (typeof window !== "undefined") {
  import("socket.io-client")
    .then((socketio) => {
      io = socketio.io;
      socketAvailable = true;
    })
    .catch((error) => {
      console.info("Socket.io-client not installed:", error.message);
      io = createMockSocket;
      socketAvailable = false;
    });
} else {
  io = createMockSocket;
  socketAvailable = false;
}

class SocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.useWebSocket = true;
    this.fallbackMode = false;
  }

  connect() {
    if (!io || typeof io !== "function" || !socketAvailable) {
      console.warn("Socket.io not available, using mock socket");
      this.fallbackMode = true;
      return this.createMockSocketInstance();
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    this.socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 2000,
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket.id);
      this.isConnected = true;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("⚠️ Socket connection error:", error.message);
    });

    return this.socket;
  }

  createMockSocketInstance() {
    const mock = createMockSocket();
    this.socket = mock;
    return mock;
  }

  on(event, callback) {
    if (this.socket) this.socket.on(event, callback);
  }

  off(event, callback) {
    if (this.socket) this.socket.off(event, callback);
  }

  emit(event, data) {
    if (this.socket) this.socket.emit(event, data);
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }
}

const socketClient = new SocketClient();
export default socketClient;

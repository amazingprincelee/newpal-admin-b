import express from "express";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoute.js"; 


const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/auth", authRoutes);

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*", // adjust to your frontend origin
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Example: listening for a custom event
  socket.on("sendNotification", (data) => {
    console.log("Notification received:", data);

    // Broadcast to all connected clients
    io.emit("receiveNotification", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const port = process.env.PORT || 3002;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

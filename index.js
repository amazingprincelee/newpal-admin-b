import express from "express";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoute.js"; 
import userRoutes from "./routes/userRoute.js";
import assertRoute from "./routes/assetRoute.js";
import customerRoute from "./routes/customerRoute.js";
import incomingShipmentRoute from "./routes/incomingShipmentRoute.js";
import outgoingShipmentRoute from "./routes/outgoingShipmentRoute.js"
import inventoryRoute  from  "./routes/inventoryRoute.js";
import productionBatchRoute from "./routes/productionBatchRoute.js";
import invoiceRoute from "./routes/invoiceRoute.js";
import salesOrdersRoute from "./routes/salesOrdersRoute.js";
import vendorRoute from "./routes/vendorRoute.js";
import visitorEntryRoute from "./routes/visitorEntryRoute.js"
import connectDB from "./config/db.js";



const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

connectDB()

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/asset", assertRoute);
app.use("/api/customer", customerRoute);
app.use("/api/incoming-shipment", incomingShipmentRoute);
app.use("/api/outgoing-shipment", outgoingShipmentRoute);
app.use("/api/inventory", inventoryRoute);
app.use("/api/invoice", invoiceRoute);
app.use("/api/production", productionBatchRoute);
app.use("/api/sales", salesOrdersRoute);
app.use("/api/vendor", vendorRoute);
app.use("/api/visitor", visitorEntryRoute);

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

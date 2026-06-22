// =========================================================================
// BACKEND ENTRY POINT (Node.js + Express + Socket.io + Mongoose)
// Note: This file represents the required Express backend structure.
// =========================================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] },
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Rate Limiting (Security)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.error("MongoDB Connection Error: ", err));

// ==========================================
// MOCK ROUTES (Following MVC)
// ==========================================

// Mock Middleware for JWT Auth
const protect = (req, res, next) => {
  // Validate JWT Logic Here
  next();
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Role check logic
    next();
  };
};

// Routes Setup
// app.use("/api/v1/auth", require("./routes/authRoutes")); // Register, Login, Reset Password
// app.use("/api/v1/users", protect, require("./routes/userRoutes")); // Profile mgmt
// app.use("/api/v1/services", require("./routes/serviceRoutes")); // CRUD services
// app.use("/api/v1/bookings", protect, require("./routes/bookingRoutes")); // Razorpay integrations
// app.use("/api/v1/reviews", protect, require("./routes/reviewRoutes")); // Gemini sentiment analysis

// ==========================================
// SOCKET.IO (Real-Time Chat)
// ==========================================
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join Private Room
  socket.on("join_room", (bookingId) => {
    socket.join(bookingId);
    console.log(`User joined room: ${bookingId}`);
  });

  // Send Message
  socket.on("send_message", (data) => {
    // Broadcast to specific room
    socket.to(data.room).emit("receive_message", data);
    // Save message to MongoDB
  });

  // Typing Indicators
  socket.on("typing", (data) => socket.to(data.room).emit("user_typing", data));

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

// Server Initialization
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

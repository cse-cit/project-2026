// =========================================================================
// MONGODB SCHEMAS & MODELS (Mongoose)
// Comprehensive database architecture for the Marketplace
// =========================================================================
const mongoose = require("mongoose");

// 1. User Schema (Base collection for Admin, Customer, Worker logic via discriminator/role)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ["customer", "worker", "admin"],
    default: "customer",
  },
  phone: { type: String },
  profileImage: { type: String }, // Cloudinary URL
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: false }, // [longitude, latitude] for GeoSpatial queries
  },
  createdAt: { type: Date, default: Date.now },
});
userSchema.index({ location: "2dsphere" }); // Crucial for Maps proximity search
const User = mongoose.model("User", userSchema);

// 2. Worker Profile Schema (Extension of User)
const workerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  category: { type: String, required: true },
  experienceYears: { type: Number, required: true },
  hourlyRate: { type: Number, required: true },
  bio: { type: String },
  documents: [{ type: String }], // Array of Cloudinary URLs (Aadhar, Certificates)
  isVerified: { type: Boolean, default: false },
  availability: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
});
const WorkerProfile = mongoose.model("WorkerProfile", workerProfileSchema);

// 3. Service Category Schema
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String },
  description: { type: String },
});
const Service = mongoose.model("Service", serviceSchema);

// 4. Booking Schema
const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkerProfile",
      required: true,
    },
    serviceDetails: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled", "rejected"],
      default: "pending",
    },
    estimatedCost: { type: Number }, // Generated via AI Price Prediction
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);
const Booking = mongoose.model("Booking", bookingSchema);

// 5. Review Schema
const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkerProfile",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    aiSentiment: { type: String, enum: ["positive", "neutral", "negative"] }, // Populated via Gemini API
  },
  { timestamps: true }
);
const Review = mongoose.model("Review", reviewSchema);

// 6. Chat Message Schema
const messageSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);
const Message = mongoose.model("Message", messageSchema);

module.exports = { User, WorkerProfile, Service, Booking, Review, Message };

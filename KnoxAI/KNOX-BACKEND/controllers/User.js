import userModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await userModel.create({
    name,
    email,
    password: hashedPassword,
  });
  res.status(201).json({ message: "User created successfully", user: newUser });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ error: "Invalid password" });
  }
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
res.cookie("token", token, {
  httpOnly: true,
  secure: true,      // Required for Render (HTTPS)
  sameSite: "none",  // Required for cross-domain cookies
  maxAge: 3600000    // 1 hour
});
  res
    .status(200)
    .json({ message: "Login successful", user: user, token: token });
};
// routes/auth.js
export const handleLogout = (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .status(200)
    .json({ message: "Logged out successfully" });
};
export const getProfile = async (req, res) => {
  const user = await userModel.findById(req.user.id);
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }
  res.status(200).json({ message: "Profile fetched successfully", user: user });
};


export const updateProfile = async (req, res) => {
  try {
    // req.user.id comes from your verifyUser middleware
    const userId = req.user.id;

    // Now req.body will have 'name' because Multer parsed it
    const { name } = req.body;

    const updateData = {};
    if (name) updateData.name = name;

    // Check if a new avatar file was uploaded
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password"); // Don't send password back

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

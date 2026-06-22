import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Token not found" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = decoded; // store user data

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};


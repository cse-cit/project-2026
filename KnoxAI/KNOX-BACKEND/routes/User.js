import express from "express";
import { registerUser,loginUser,getProfile,handleLogout,updateProfile } from "../controllers/User.js";
import { verifyUser } from "../middleware/Auth.js";
import { Router } from "express";
import { upload } from "../middleware/upload.js";


const userRouter = Router();

userRouter.post("/signup", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", verifyUser, getProfile);
userRouter.post("/logout", handleLogout);
userRouter.put('/update', verifyUser, upload.single('avatar'), updateProfile);
export default userRouter;

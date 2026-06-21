import express from "express";
import { verifyUser } from "../middleware/Auth.js";
import { getMessages, sendMessage } from "../controllers/UserMessage.js";
const messageRouter = express.Router();

messageRouter.post("/send", verifyUser, sendMessage);
messageRouter.get("/:characterId", verifyUser, getMessages);

export default messageRouter;

import express from "express";
import { sendMessage, getMessages, getConversations } from "../controllers/chatController.js";

const chatRoutes = express.Router();

chatRoutes.post("/send", sendMessage);
chatRoutes.get("/conversations/:userId", getConversations);
chatRoutes.get("/:user1/:user2", getMessages);

export default chatRoutes;
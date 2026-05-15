import ChatModel from "../models/ChatModel.js"
import userModel from "../models/userModel.js"
import notificationModel from "../models/notificationModel.js"
import mongoose from "mongoose"

export const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, text } = req.body;
        const chat = new ChatModel({ senderId, receiverId, text });
        await chat.save();

        // Notify the receiver
        try {
            const sender = await userModel.findById(senderId).select("userName");
            const receiver = await userModel.findById(receiverId).select("userEmail");
            if (receiver?.userEmail) {
                await notificationModel.create({
                    recipientEmail: receiver.userEmail,
                    type: "message",
                    title: "New Message",
                    body: `${sender?.userName || "Someone"} sent you a message: "${text.slice(0, 60)}${text.length > 60 ? "…" : ""}"`,
                    meta: { senderId, receiverId },
                });
            }
        } catch (_) {}

        res.json({ success: true, chat });
    }
    catch (err) {
        console.error("sendMessage error:", err.message);
        res.status(500).json({ success: false, msg: "Send failed" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { user1, user2 } = req.params;

        if (!mongoose.Types.ObjectId.isValid(user1) || !mongoose.Types.ObjectId.isValid(user2)) {
            return res.json({ success: true, chat: [] });
        }

        const chat = await ChatModel.find({
            $or: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 },
            ],
        }).sort({ createdAt: 1 });
        
        res.json({ success: true, chat });
    } catch (err) {
        console.error("getMessages error:", err.message);
        res.status(500).json({ success: false, msg: "Fetch failed" });
    }
}

export const getConversations = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.json({ success: true, conversations: [] });
        }

        const chats = await ChatModel.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
        }).sort({ createdAt: -1 });

        const convMap = new Map();

        for (const chat of chats) {
            const isMe = String(chat.senderId) === String(userId);
            const otherId = String(isMe ? chat.receiverId : chat.senderId);

            if (!convMap.has(otherId)) {
                convMap.set(otherId, {
                    otherId,
                    lastMessage: chat.text,
                    lastTime: chat.createdAt,
                });
            }
        }

        const conversations = await Promise.all(
            Array.from(convMap.values()).map(async (conv) => {
                try {
                    if (!mongoose.Types.ObjectId.isValid(conv.otherId)) {
                        return { ...conv, otherName: "Unknown User", otherEmail: "" };
                    }
                    const user = await userModel.findById(conv.otherId).select("userName userEmail");
                    return {
                        ...conv,
                        otherName: user?.userName || "Unknown User",
                        otherEmail: user?.userEmail || "",
                    };
                } catch (_) {
                    return { ...conv, otherName: "Unknown User", otherEmail: "" };
                }
            })
        );

        res.json({ success: true, conversations });
    } catch (err) {
        console.error("getConversations error:", err.message);
        res.status(500).json({ success: false, msg: "Fetch failed" });
    }
}

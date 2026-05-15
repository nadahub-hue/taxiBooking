import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "travel-buddy-users",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "travel-buddy-users",
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
},
    { timestamps: true }
);

const ChatModel = mongoose.model("Chat", chatSchema)
export default ChatModel
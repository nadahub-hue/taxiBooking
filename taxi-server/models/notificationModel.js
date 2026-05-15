import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientEmail: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["message", "booking_accepted", "booking_complete", "account_removed", "driver_approved", "driver_rejected", "driver_suspended", "driver_reinstated", "payment_confirmed", "admin_message"],
      required: true,
    },
    title: { type: String, required: true },
    body:  { type: String, default: "" },
    isRead: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("notification", notificationSchema);

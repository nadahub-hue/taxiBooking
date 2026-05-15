import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false,
    },
    payerEmail: { type: String, default: "" },
    amount: { type: Number, required: true },
    escrowAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ["card", "cash"], default: "card" },
    transactionId: { type: String, required: true, unique: true },
    paymentStatus: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "success",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);

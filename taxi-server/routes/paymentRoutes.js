import express from "express";
import crypto from "crypto";
import paymentModel from "../models/paymentModel.js";
import bookingModel from "../models/bookingModel.js";
import notificationModel from "../models/notificationModel.js";

const router = express.Router();

async function pushNotification({ recipientEmail, type, title, body = "", meta = {} }) {
  try {
    await notificationModel.create({ recipientEmail, type, title, body, meta });
  } catch (e) {
    console.error("pushNotification error:", e.message);
  }
}

router.post("/payment", async (req, res) => {
  try {
    const { amount, escrowAmount, paymentMethod, bookingId, payerEmail } = req.body;

    if (!amount) {
      return res.status(400).json({ flag: false, msg: "Amount is required" });
    }

    const payment = await paymentModel.create({
      amount,
      escrowAmount: escrowAmount || 0,
      paymentMethod: paymentMethod || "card",
      bookingId: bookingId || null,
      payerEmail: payerEmail || "",
      transactionId: crypto.randomUUID(),
      paymentStatus: "success",
    });

    if (bookingId) {
      const booking = await bookingModel.findById(bookingId);
      if (booking && booking.status === "driver_accepted" && booking.participantEmails?.length > 0) {
        if (payerEmail) {
          await pushNotification({
            recipientEmail: payerEmail,
            type: "payment_confirmed",
            title: "Payment Confirmed 💳",
            body: `Your payment of OMR ${Number(amount).toFixed(3)} has been confirmed. Thank you!`,
            meta: { bookingId },
          });
        }
        const payments = await paymentModel.find({ bookingId, paymentStatus: "success" });
        const paidEmails = [...new Set(payments.map((p) => p.payerEmail).filter(Boolean))];
        const allPaid = booking.participantEmails.every((email) => paidEmails.includes(email));
        if (allPaid) {
          booking.status = "completed";
          await booking.save();
        }
      }
    }

    return res.json({ flag: true, msg: "Payment saved", payment });
  } catch (err) {
    console.log("PAYMENT ERROR:", err.message);
    return res.status(500).json({ flag: false, msg: err.message });
  }
});

export default router;

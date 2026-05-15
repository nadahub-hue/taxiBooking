import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "travel-buddy-trips", required: true },
    participantEmails: [{ type: String }],
    totalFare: { type: Number, required: true },
    farePerPerson: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "driver_ready", "driver_accepted", "completed", "paid"],
      default: "pending"
    },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "travel-buddy-drivers", default: null },
    driverName: { type: String, default: "" },
    vehicleModel: { type: String, default: "" },
    plateNumber: { type: String, default: "" },
  },
  { timestamps: true }
)

const bookingModel = mongoose.model("travel-buddy-bookings", bookingSchema)
export default bookingModel

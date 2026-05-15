import mongoose from "mongoose"

const feedbackSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "travel-buddy-drivers" },
    rating: { type: Number, required: true },
    comment: { type: String }
  },
  { timestamps: true }
)

const feedbackModel = mongoose.model("travel-buddy-feedbacks", feedbackSchema)
export default feedbackModel

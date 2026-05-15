import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    userPhone: { type: String, required: true },
    userEmail: { type: String, required: true, unique: true },
    userPassword: { type: String, required: true },
    userGender: { type: String, enum: ["male", "female", "other"], default: "other" },
    preferredGender: { type: String, enum: ["any", "male", "female"], default: "any" },

    isOnline: {type:Boolean, default: false},
    lastSeen : {type: Date},  
   resetToken: String,
  resetTokenExp: Date
  },
  { timestamps: true }
)

const userModel = mongoose.model("travel-buddy-users", userSchema)
export default userModel

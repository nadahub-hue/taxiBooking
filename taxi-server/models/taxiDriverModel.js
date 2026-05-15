import mongoose from "mongoose"

const taxiDriverSchema = new mongoose.Schema(
  {
    driverName: {
      type: String,
      required: true,
      trim: true
    },

    driverPhone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    driverEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    driverPassword: {
      type: String,
      required: true
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    taxiPermitNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    vehicleModel: {
      type: String,
      required: true,
      trim: true
    },

    plateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    nationalId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    experienceYears: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: ["pending_verification", "verified", "rejected", "suspended"],
      default: "pending_verification"
    },

    isVerifiedDriver: {
      type: Boolean,
      default: false
    },

    licenseImage: { type: String },
    permitImage: { type: String },
    carRegistrationImage: { type: String },
    rejectionReason: { type: String, default: "" },
    resetToken: { type: String },
    resetTokenExp: { type: Date },
    profilePic: { type: String, default: "" },
    driverLat: { type: Number, default: null },
    driverLng: { type: Number, default: null },

  },
  { timestamps: true }


)

const taxiDriverModel = mongoose.model("travel-buddy-drivers", taxiDriverSchema)

export default taxiDriverModel

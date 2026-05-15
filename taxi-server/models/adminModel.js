import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    adminName: { type: String, required: true },

    adminEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    adminPassword: { type: String, required: true },
  },
  { timestamps: true }
);

// remove password when sending response
adminSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.adminPassword;
    return ret;
  },
});

const adminModel = mongoose.model("travel-buddy-admins", adminSchema);

export default adminModel;
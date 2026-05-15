import taxiDriverModel from "../models/taxiDriverModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import notificationModel from "../models/notificationModel.js";

async function pushNotification({ recipientEmail, type, title, body = "", meta = {} }) {
  try {
    await notificationModel.create({ recipientEmail, type, title, body, meta });
  } catch (e) {
    console.error("pushNotification error:", e.message);
  }
}
export const driverRegister = async (req, res) => {
 try {
   const {
     driverName,
     driverPhone,
     driverEmail,
     driverPassword,
     licenseNumber,
     taxiPermitNumber,
     vehicleModel,
     plateNumber,
     nationalId,
     experienceYears,
   } = req.body;
   const licenseFile = req.file ? req.file.filename : null;
   if (
     !driverName ||
     !driverPhone ||
     !driverEmail ||
     !driverPassword ||
     !licenseNumber ||
     !taxiPermitNumber ||
     !vehicleModel ||
     !plateNumber ||
     !nationalId ||
     experienceYears === undefined
   ) {
     return res.status(400).json({
       flag: false,
       serverMsg: "Please fill in all required driver details",
     });
   }
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   const phoneRegex = /^(9|7|2)\d{7}$/;
   const passwordRegex =
     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
   if (!emailRegex.test(driverEmail)) {
     return res.status(400).json({
       flag: false,
       serverMsg: "Invalid email address",
     });
   }
   if (!phoneRegex.test(driverPhone)) {
     return res.status(400).json({
       flag: false,
       serverMsg: "Invalid Omani phone number",
     });
   }
   if (!passwordRegex.test(driverPassword)) {
     return res.status(400).json({
       flag: false,
       serverMsg:
         "Password must contain uppercase, lowercase, number, and special character",
     });
   }
   const existingDriver = await taxiDriverModel.findOne({
     $or: [{ driverEmail }, { driverPhone }, { nationalId }, { licenseNumber }],
   });
   if (existingDriver) {
     return res.status(409).json({
       flag: false,
       serverMsg:
         "Driver already exists with this email, phone, national ID, or license number",
     });
   }
   const hashedPassword = await bcrypt.hash(driverPassword, 10);
   const newDriver = await taxiDriverModel.create({
     driverName,
     driverPhone,
     driverEmail,
     driverPassword: hashedPassword,
     licenseNumber,
     taxiPermitNumber,
     vehicleModel,
     plateNumber,
     nationalId,
     experienceYears,
     licenseImage: licenseFile, 
     role: "taxi_driver",
     status: "pending_verification",
     isVerifiedDriver: false,
   });
   return res.status(201).json({
     flag: true,
     serverMsg:
       "Driver registered successfully. Your account is pending verification.",
     data: {
       _id: newDriver._id,
       driverName: newDriver.driverName,
       driverEmail: newDriver.driverEmail,
       driverPhone: newDriver.driverPhone,
       status: newDriver.status,
     },
   });
 } catch (error) {
   console.log("driverRegister error:", error);
   return res.status(500).json({
     flag: false,
     serverMsg: "Server error during driver registration",
   });
 }
};
export const driverLogin = async (req, res) => {
 try {
   const { driverEmail, driverPassword } = req.body;
   if (!driverEmail || !driverPassword) {
     return res.status(400).json({
       flag: false,
       serverMsg: "Email and password are required",
     });
   }
   const foundDriver = await taxiDriverModel.findOne({ driverEmail });
   if (!foundDriver) {
     return res.status(404).json({
       flag: false,
       serverMsg: "Driver account not found",
     });
   }
   const isPasswordMatched = await bcrypt.compare(
     driverPassword,
     foundDriver.driverPassword
   );
   if (!isPasswordMatched) {
     return res.status(401).json({
       flag: false,
       serverMsg: "Invalid email or password",
     });
   }
   if (foundDriver.status === "pending_verification") {
     return res.status(403).json({
       flag: false,
       serverMsg:
         "Your taxi driver account is still pending verification. Please wait for approval.",
     });
   }
   if (foundDriver.status === "rejected") {
     return res.status(403).json({
       flag: false,
       serverMsg:
         "Your taxi driver account has been rejected. Please contact support.",
     });
   }
   if (!foundDriver.isVerifiedDriver) {
     return res.status(403).json({
       flag: false,
       serverMsg: "Driver account is not verified",
     });
   }
   const token = jwt.sign(
     {
       id: foundDriver._id,
       role: foundDriver.role,
       driverEmail: foundDriver.driverEmail,
     },
     process.env.JWT_SECRET,
     { expiresIn: "7d" }
   );
   return res.status(200).json({
     flag: true,
     serverMsg: "Driver login successful",
     token,
     data: {
       _id: foundDriver._id,
       driverName: foundDriver.driverName,
       driverEmail: foundDriver.driverEmail,
       driverPhone: foundDriver.driverPhone,
       role: foundDriver.role,
       status: foundDriver.status,
     },
   });
 } catch (error) {
   console.log("driverLogin error:", error);
   return res.status(500).json({
     flag: false,
     serverMsg: "Server error during driver login",
   });
 }
};
export const verifyDriverByAdmin = async (req, res) => {
 try {
   const { driverId } = req.params;
   const { action, rejectionReason } = req.body;
   const foundDriver = await taxiDriverModel.findById(driverId);
   if (!foundDriver) {
     return res.status(404).json({
       flag: false,
       serverMsg: "Driver not found",
     });
   }
   if (action === "approve") {
     foundDriver.status = "verified";
     foundDriver.isVerifiedDriver = true;
     await pushNotification({
       recipientEmail: foundDriver.driverEmail,
       type: "driver_approved",
       title: "Registration Approved ✅",
       body: "Congratulations! Your driver account has been approved. You can now log in and start accepting trips.",
     });
   } else if (action === "reject") {
     foundDriver.status = "rejected";
     foundDriver.isVerifiedDriver = false;
     if (rejectionReason) foundDriver.rejectionReason = rejectionReason;
     await pushNotification({
       recipientEmail: foundDriver.driverEmail,
       type: "driver_rejected",
       title: "Registration Rejected ❌",
       body: `Your driver registration has been rejected by the admin. ${rejectionReason ? "Reason: " + rejectionReason : "Please contact support for more information."}`,
     });
   } else {
     return res.status(400).json({
       flag: false,
       serverMsg: "Invalid action. Use approve or reject",
     });
   }
   await foundDriver.save();
   return res.status(200).json({
     flag: true,
     serverMsg: `Driver ${action}d successfully`,
     data: foundDriver,
   });
 } catch (error) {
   console.log("verifyDriverByAdmin error:", error);
   return res.status(500).json({
     flag: false,
     serverMsg: "Server error during driver verification",
   });
 }
};
 

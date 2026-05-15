import express from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/userModel.js";
import taxiDriverModel from "../models/taxiDriverModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Nodemailer config error:", error.message);
  } else {
    console.log("✅ Nodemailer is ready to send emails");
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ userEmail: email });
    if (!user) {
      return res.json({ flag: false, msg: "Email not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExp = Date.now() + 60 * 60 * 1000; 
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Travel Buddy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Travel Buddy - Reset your password",
      html: `
        <p>Hello ${user.userName || ""},</p>
        <p>You requested to reset your password.</p>
        <p>Click the link below (valid for 1 hour):</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you did not request this, please ignore.</p>
      `,
    });

    res.json({
      flag: true,
      msg: "Reset link has been sent to your email.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ flag: false, msg: "Server error" });
  }
});

router.post("/reset-password-email", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({ flag: false, msg: "Invalid or expired link" });
    }

    user.userPassword = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExp = undefined;
    await user.save();

    res.json({ flag: true, msg: "Password has been reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ flag: false, msg: "Server error" });
  }
});

/* --------- Driver Forgot Password --------- */
router.post("/driver-forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const driver = await taxiDriverModel.findOne({ driverEmail: email });
    if (!driver) return res.json({ flag: false, msg: "Email not found" });

    const token = crypto.randomBytes(32).toString("hex");
    driver.resetToken = token;
    driver.resetTokenExp = Date.now() + 60 * 60 * 1000;
    await driver.save();

    const resetLink = `${process.env.CLIENT_URL}/driver-reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Travel Buddy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Travel Buddy Driver – Reset your password",
      html: `
        <p>Hello ${driver.driverName},</p>
        <p>Click the link below to reset your driver account password (valid for 1 hour):</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    res.json({ flag: true, msg: "Reset link sent to your email." });
  } catch (err) {
    console.error("Driver forgot password error:", err);
    res.status(500).json({ flag: false, msg: "Server error" });
  }
});

/* --------- Driver Reset Password --------- */
router.post("/driver-reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const driver = await taxiDriverModel.findOne({
      resetToken: token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!driver) return res.json({ flag: false, msg: "Invalid or expired link" });

    driver.driverPassword = await bcrypt.hash(newPassword, 10);
    driver.resetToken = undefined;
    driver.resetTokenExp = undefined;
    await driver.save();

    res.json({ flag: true, msg: "Password reset successfully." });
  } catch (err) {
    console.error("Driver reset password error:", err);
    res.status(500).json({ flag: false, msg: "Server error" });
  }
});

/* --------- User Change Password --------- */
router.post("/change-password", async (req, res) => {
  try {
    const { userEmail, currentPassword, newPassword } = req.body;
    const user = await User.findOne({ userEmail });
    if (!user) return res.json({ flag: false, msg: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.userPassword);
    if (!match) return res.json({ flag: false, msg: "Current password is incorrect" });

    user.userPassword = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ flag: true, msg: "Password changed successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ flag: false, msg: "Server error" });
  }
});

/* --------- Driver Change Password --------- */
router.post("/driver-change-password", async (req, res) => {
  try {
    const { driverEmail, currentPassword, newPassword } = req.body;
    const driver = await taxiDriverModel.findOne({ driverEmail });
    if (!driver) return res.json({ flag: false, msg: "Driver not found" });

    const match = await bcrypt.compare(currentPassword, driver.driverPassword);
    if (!match) return res.json({ flag: false, msg: "Current password is incorrect" });

    driver.driverPassword = await bcrypt.hash(newPassword, 10);
    await driver.save();
    res.json({ flag: true, msg: "Password changed successfully." });
  } catch (err) {
    console.error("Driver change password error:", err);
    res.status(500).json({ flag: false, msg: "Server error" });
  }
});

export default router;

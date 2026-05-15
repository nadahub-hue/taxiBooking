import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import session from "express-session";
import multer from "multer";
import fs from "fs";

import driverRoutes from "./routes/driverRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

import userModel from "./models/userModel.js";
import taxiDriverModel from "./models/taxiDriverModel.js";
import tripModel from "./models/tripModel.js";
import bookingModel from "./models/bookingModel.js";
import feedbackModel from "./models/feedbackModel.js";
import adminModel from "./models/adminModel.js";
import paymentModel from "./models/paymentModel.js";
import notificationModel from "./models/notificationModel.js";
import ChatModel from "./models/ChatModel.js";

/* -------------------- Setup -------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter: pdfFilter });
const uploadImage = multer({ storage, fileFilter: imageFilter });

const app = express();

/* ---- Notification helper ---- */
async function pushNotification({ recipientEmail, type, title, body = "", meta = {} }) {
  try {
    await notificationModel.create({ recipientEmail, type, title, body, meta });
  } catch (e) {
    console.error("pushNotification error:", e.message);
  }
}

/* -------------------- Debug env -------------------- */
console.log("PORT:", process.env.PORT);
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);

/* -------------------- Middleware -------------------- */
// Render (and most PaaS hosts) terminate TLS at a proxy in front of Node.
// We need to trust the proxy so secure cookies and req.protocol work correctly.
app.set("trust proxy", 1);

// Build allowed-origins list from env + sensible defaults.
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header (curl, server-to-server, mobile webviews).
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any subdomain of onrender.com / vercel.app / netlify.app for convenience.
      if (/\.(onrender\.com|vercel\.app|netlify\.app)$/i.test(new URL(origin).hostname)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin not allowed: ${origin}`), false);
    },
    credentials: true,
  })
);

app.use(express.json());

const isProduction = process.env.NODE_ENV === "production";
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // In production behind HTTPS we need Secure + SameSite=None so the
      // cookie travels cross-site between the frontend and this API.
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
    },
  })
);

/* -------------------- Static Files -------------------- */
app.use("/uploads", express.static(uploadsDir));

/* -------------------- Routes -------------------- */
app.use(authRoutes);
app.use(paymentRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/chat", chatRoutes);

/* -------------------- User Register -------------------- */
app.post("/userRegister", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        flag: false,
        serverMsg: "Database not connected",
      });
    }

    const exist = await userModel.findOne({ userEmail: req.body.email });

    if (exist) {
      return res.json({
        serverMsg: "User already exists!",
        flag: false,
      });
    }

    const hashed = await bcrypt.hash(req.body.pwd, 10);

    await userModel.create({
      userName: req.body.fullName,
      userPhone: req.body.phone,
      userEmail: req.body.email,
      userPassword: hashed,
      userGender: req.body.gender,
      preferredGender: req.body.preferredGender || "any",
    });

    return res.json({
      serverMsg: "Registration Success!",
      flag: true,
    });
  } catch (err) {
    console.error("userRegister error:", err);
    return res.status(500).json({
      serverMsg: "Registration error",
      flag: false,
    });
  }
});

/* -------------------- User Login -------------------- */
app.post("/userLogin", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        loginStatus: false,
        serverMsg: "Database not connected",
      });
    }

    const user = await userModel.findOne({
      userEmail: req.body.userEmail,
    });

    if (!user) {
      return res.json({
        loginStatus: false,
        serverMsg: "User not found",
      });
    }

    const match = await bcrypt.compare(
      req.body.userPassword,
      user.userPassword
    );

    if (!match) {
      return res.json({
        loginStatus: false,
        serverMsg: "Wrong password",
      });
    }

    return res.json({
      loginStatus: true,
      serverMsg: "Welcome",
      user,
    });
  } catch (err) {
    console.error("userLogin error:", err);
    return res.status(500).json({
      loginStatus: false,
      serverMsg: "Login error",
    });
  }
});

/* -------------------- Driver Register -------------------- */
app.post(
  "/driverRegister",
  upload.fields([
    { name: "licenseFile", maxCount: 1 },
    { name: "permitFile", maxCount: 1 },
    { name: "carRegistrationFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ flag: false, serverMsg: "Database not connected" });
      }

      const exist = await taxiDriverModel.findOne({ driverEmail: req.body.driverEmail });
      if (exist) {
        return res.json({ serverMsg: "Driver already exists!", flag: false });
      }

      const hashed = await bcrypt.hash(req.body.driverPassword, 10);

      await taxiDriverModel.create({
        driverName: req.body.driverName,
        driverPhone: req.body.driverPhone,
        driverEmail: req.body.driverEmail,
        driverPassword: hashed,
        licenseNumber: req.body.licenseNumber,
        taxiPermitNumber: req.body.taxiPermitNumber,
        vehicleModel: req.body.vehicleModel,
        plateNumber: req.body.plateNumber,
        nationalId: req.body.nationalId,
        experienceYears: req.body.experienceYears,
        licenseImage: req.files?.licenseFile?.[0]?.filename || null,
        permitImage: req.files?.permitFile?.[0]?.filename || null,
        carRegistrationImage: req.files?.carRegistrationFile?.[0]?.filename || null,
        status: "pending_verification",
        isVerifiedDriver: false,
      });

      return res.json({ serverMsg: "Registered. Wait for admin approval.", flag: true });
    } catch (err) {
      console.error("driverRegister error:", err);
      return res.status(500).json({ serverMsg: "Driver error", flag: false });
    }
  }
);

/* -------------------- Driver Login -------------------- */
app.post("/driverLogin", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ flag: false, serverMsg: "Database not connected" });
    }

    const driver = await taxiDriverModel.findOne({ driverEmail: req.body.driverEmail });

    if (!driver) {
      return res.json({ flag: false, serverMsg: "Driver not found" });
    }

    const match = await bcrypt.compare(req.body.driverPassword, driver.driverPassword);

    if (!match) {
      return res.json({ flag: false, serverMsg: "Wrong password" });
    }

    if (driver.status === "pending_verification") {
      return res.json({ flag: false, serverMsg: "Your account is pending admin verification." });
    }

    if (driver.status === "rejected") {
      return res.json({ flag: false, serverMsg: "Your account has been rejected. Contact support." });
    }

    if (driver.status === "suspended") {
      return res.json({ flag: false, serverMsg: "Your account has been suspended by the admin." });
    }

    if (!driver.isVerifiedDriver) {
      return res.json({ flag: false, serverMsg: "Driver account is not verified yet. Please wait for admin approval." });
    }

    return res.json({
      flag: true,
      serverMsg: "Welcome Driver",
      driver: {
        _id: driver._id,
        driverName: driver.driverName,
        driverEmail: driver.driverEmail,
        driverPhone: driver.driverPhone,
        status: driver.status,
      },
    });
  } catch (err) {
    console.error("driverLogin error:", err);
    return res.status(500).json({ flag: false, serverMsg: "Driver login error" });
  }
});



/* -------------------- Admin Login -------------------- */
app.post("/adminLogin", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        loginStatus: false,
        serverMsg: "Database not connected",
      });
    }

    const admin = await adminModel.findOne({
      adminEmail: req.body.adminEmail,
    });

    if (!admin) {
      return res.json({
        loginStatus: false,
        serverMsg: "Admin not found",
      });
    }

    const match = await bcrypt.compare(
      req.body.adminPassword,
      admin.adminPassword
    );

    if (!match) {
      return res.json({
        loginStatus: false,
        serverMsg: "Incorrect password",
      });
    }

    return res.json({
      loginStatus: true,
      serverMsg: "Admin login successful",
      admin: {
        _id: admin._id,
        adminName: admin.adminName,
        adminEmail: admin.adminEmail,
      },
    });
  } catch (err) {
    console.error("adminLogin error:", err);
    return res.status(500).json({
      loginStatus: false,
      serverMsg: "Admin login error",
    });
  }
});

/* -------------------- Admin: Get All Drivers -------------------- */
app.get("/admin/drivers", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ serverMsg: "Database not connected" });
    }
    const drivers = await taxiDriverModel.find({}).select("-driverPassword");
    return res.json({ drivers });
  } catch (err) {
    console.error("admin/drivers error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Admin: Delete Driver -------------------- */
app.delete("/admin/drivers/:driverId", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ serverMsg: "Database not connected" });
    }
    const driver = await taxiDriverModel.findById(req.params.driverId);
    if (!driver) {
      return res.status(404).json({ flag: false, serverMsg: "Driver not found" });
    }
    await pushNotification({
      recipientEmail: driver.driverEmail,
      type: "account_removed",
      title: "Account Removed",
      body: "Your driver account has been removed by the admin. Please contact support for more information.",
      meta: {},
    });
    await taxiDriverModel.findByIdAndDelete(req.params.driverId);
    return res.json({ flag: true, serverMsg: "Driver removed successfully" });
  } catch (err) {
    console.error("delete driver error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Admin: Suspend / Reinstate Driver -------------------- */
app.patch("/admin/drivers/:driverId/suspend", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });
    const driver = await taxiDriverModel.findById(req.params.driverId);
    if (!driver) return res.status(404).json({ flag: false, serverMsg: "Driver not found" });
    if (driver.status === "suspended") {
      driver.status = "verified";
      driver.isVerifiedDriver = true;
      await driver.save();
      await pushNotification({
        recipientEmail: driver.driverEmail,
        type: "driver_reinstated",
        title: "Account Reinstated ✅",
        body: "Your driver account has been reinstated. You can now log in and accept trips again.",
      });
      return res.json({ flag: true, serverMsg: "Driver reinstated successfully" });
    } else {
      driver.status = "suspended";
      driver.isVerifiedDriver = false;
      await driver.save();
      await pushNotification({
        recipientEmail: driver.driverEmail,
        type: "driver_suspended",
        title: "Account Suspended ⚠️",
        body: "Your driver account has been suspended by the admin. Please contact support for more information.",
      });
      return res.json({ flag: true, serverMsg: "Driver suspended successfully" });
    }
  } catch (err) {
    console.error("suspend driver error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Create Trip -------------------- */
app.post("/createTrip", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        serverMsg: "Database not connected",
      });
    }

    const trip = await tripModel.create(req.body);

    return res.json({
      serverMsg: "Trip created",
      trip,
    });
  } catch (err) {
    console.error("createTrip error:", err);
    return res.status(500).json({
      serverMsg: "Trip error",
    });
  }
});

/* -------------------- Search Trips -------------------- */
app.get("/searchTrips", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ serverMsg: "Database not connected" });
    }

    const { fromLocation, toLocation, travelDate, genderRestriction } = req.query;
    const filter = {};

    if (fromLocation) filter.fromLocation = { $regex: fromLocation, $options: "i" };
    if (toLocation) filter.toLocation = { $regex: toLocation, $options: "i" };

    if (travelDate) {
      const start = new Date(travelDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(travelDate);
      end.setHours(23, 59, 59, 999);
      filter.travelDate = { $gte: start, $lte: end };
    }

    if (genderRestriction && genderRestriction !== "any") {
      filter.genderRestriction = { $in: [genderRestriction, "any"] };
    }

    const trips = await tripModel.find(filter);
    return res.json(trips);
  } catch (err) {
    console.error("searchTrips error:", err);
    return res.status(500).json({ serverMsg: "Search error" });
  }
});

app.post("/confirmBooking", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        serverMsg: "Database not connected",
      });
    }

    // ✅ validate tripId first
    if (!req.body.tripId || !mongoose.Types.ObjectId.isValid(req.body.tripId)) {
      return res.status(400).json({
        serverMsg: "Invalid or missing tripId",
      });
    }

    const trip = await tripModel.findById(req.body.tripId);

    if (!trip) {
      return res.status(404).json({
        serverMsg: "Trip not found",
      });
    }

    const booking = await bookingModel.create({
      ...req.body,
      farePerPerson: 0,
      totalFare: 0,
      status: "driver_ready",
    });

    return res.json({
      serverMsg: "Booking confirmed",
      booking,
    });
  } catch (err) {
    console.error("confirmBooking error:", err);
    return res.status(500).json({
      serverMsg: "Booking error",
      error: err.message,
    });
  }
});

/* -------------------- Process Payment -------------------- */
app.post("/processPayment", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        serverMsg: "Database not connected",
      });
    }

    const payment = await paymentModel.create({
      ...req.body,
      transactionId: "TXN-" + Date.now(),
      paymentStatus: "success",
    });

    return res.json({
      serverMsg: "Payment success",
      payment,
    });
  } catch (err) {
    console.error("processPayment error:", err);
    return res.status(500).json({
      serverMsg: "Payment failed",
    });
  }
});

/* -------------------- Send Feedback -------------------- */
app.post("/sendFeedback", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        serverMsg: "Database not connected",
      });
    }

    const { userEmail, rating, comment, driverId } = req.body;

    await feedbackModel.create({
      userEmail,
      rating,
      comment,
      driverId: driverId || undefined,
    });

    return res.json({
      serverMsg: "Feedback saved. Thank you!",
    });
  } catch (err) {
    console.error("sendFeedback error:", err);
    return res.status(500).json({
      serverMsg: "Feedback error",
    });
  }
});

/* -------------------- Get All Bookings for a Participant (email) -------------------- */
app.get("/bookings/user/:email", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });
    const bookings = await bookingModel
      .find({ participantEmails: req.params.email })
      .populate("tripId")
      .sort({ createdAt: -1 });
    return res.json({ bookings });
  } catch (err) {
    console.error("bookings/user error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Mark Booking as Complete -------------------- */
app.patch("/bookings/:bookingId/complete", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });
    const booking = await bookingModel.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ flag: false, serverMsg: "Booking not found" });
    if (booking.status !== "driver_accepted")
      return res.json({ flag: false, serverMsg: "Booking cannot be marked complete yet" });
    booking.status = "completed";
    await booking.save();

    // Notify all participants
    if (booking.participantEmails?.length) {
      for (const email of booking.participantEmails) {
        await pushNotification({
          recipientEmail: email,
          type: "booking_complete",
          title: "Trip Completed ✅",
          body: "Your trip has been marked as complete. You can now leave feedback!",
          meta: { bookingId: booking._id },
        });
      }
    }

    return res.json({ flag: true, serverMsg: "Booking marked as complete", booking });
  } catch (err) {
    console.error("complete booking error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Pending Payment Bookings for a Participant -------------------- */
app.get("/bookings/pending-payment/:email", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });

    const { email } = req.params;

    const bookings = await bookingModel
      .find({ participantEmails: email, status: "confirmed" })
      .populate("tripId");

    const pending = [];
    for (const booking of bookings) {
      const paid = await paymentModel.findOne({
        bookingId: booking._id,
        payerEmail: email,
        paymentStatus: "success",
      });
      if (!paid) pending.push(booking);
    }

    return res.json({ bookings: pending });
  } catch (err) {
    console.error("pending-payment error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Get Trips by Owner -------------------- */
app.get("/trips/owner/:userId", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });
    const trips = await tripModel.find({ ownerId: req.params.userId });
    return res.json({ trips });
  } catch (err) {
    console.error("trips/owner error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Driver: Available Bookings -------------------- */
app.get("/bookings/available", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });

    const bookings = await bookingModel
      .find({ status: "driver_ready", driverId: null })
      .populate("tripId");
    return res.json({ bookings });
  } catch (err) {
    console.error("bookings/available error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Driver: Accept Booking -------------------- */
app.patch("/bookings/accept/:bookingId", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });

    const { driverId, farePerPerson } = req.body;
    if (!farePerPerson || isNaN(Number(farePerPerson)) || Number(farePerPerson) <= 0)
      return res.status(400).json({ flag: false, serverMsg: "Please enter a valid fare per person" });

    const driver = await taxiDriverModel.findById(driverId).select("-driverPassword");
    if (!driver) return res.status(404).json({ flag: false, serverMsg: "Driver not found" });

    const booking = await bookingModel.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ flag: false, serverMsg: "Booking not found" });
    if (booking.driverId)
      return res.json({ flag: false, serverMsg: "Booking already accepted by another driver" });

    const fpp = Number(farePerPerson);
    booking.driverId = driverId;
    booking.driverName = driver.driverName;
    booking.vehicleModel = driver.vehicleModel;
    booking.plateNumber = driver.plateNumber;
    booking.farePerPerson = fpp;
    booking.totalFare = fpp * (booking.participantEmails?.length || 2);
    booking.status = "driver_accepted";
    await booking.save();

    // Notify all participants
    if (booking.participantEmails?.length) {
      for (const email of booking.participantEmails) {
        await pushNotification({
          recipientEmail: email,
          type: "booking_accepted",
          title: "Driver Assigned 🚗",
          body: `Your booking has been accepted by ${driver.driverName} (${driver.vehicleModel} – ${driver.plateNumber}).`,
          meta: { bookingId: booking._id },
        });
      }
    }

    return res.json({ flag: true, serverMsg: "Booking accepted!", booking });
  } catch (err) {
    console.error("bookings/accept error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Driver: My Accepted Bookings -------------------- */
app.get("/bookings/driver/:driverId", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });

    const bookings = await bookingModel
      .find({ driverId: req.params.driverId })
      .populate("tripId");
    return res.json({ bookings });
  } catch (err) {
    console.error("bookings/driver error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Driver: Update Profile -------------------- */
app.patch("/driver/update-profile/:driverId", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });
    const { driverName, driverPhone, vehicleModel } = req.body;
    const driver = await taxiDriverModel.findByIdAndUpdate(
      req.params.driverId,
      { driverName, driverPhone, vehicleModel },
      { new: true, select: "-driverPassword" }
    );
    if (!driver) return res.status(404).json({ flag: false, serverMsg: "Driver not found" });
    return res.json({ flag: true, serverMsg: "Profile updated", driver });
  } catch (err) {
    console.error("update-profile error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Driver: Upload Profile Pic -------------------- */
app.post("/driver/update-pic/:driverId", uploadImage.single("profilePic"), async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });
    if (!req.file) return res.status(400).json({ flag: false, serverMsg: "No image uploaded" });
    const driver = await taxiDriverModel.findByIdAndUpdate(
      req.params.driverId,
      { profilePic: req.file.filename },
      { new: true, select: "-driverPassword" }
    );
    if (!driver) return res.status(404).json({ flag: false, serverMsg: "Driver not found" });
    return res.json({ flag: true, serverMsg: "Profile picture updated", profilePic: req.file.filename, driver });
  } catch (err) {
    console.error("update-pic error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Driver: Update Location -------------------- */
app.patch("/driver/location/:driverId", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });
    const { lat, lng } = req.body;
    await taxiDriverModel.findByIdAndUpdate(req.params.driverId, { driverLat: lat, driverLng: lng });
    return res.json({ flag: true });
  } catch (err) {
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Driver: Get Location -------------------- */
app.get("/driver/location/:driverId", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });
    const driver = await taxiDriverModel.findById(req.params.driverId).select("driverLat driverLng driverName");
    if (!driver) return res.status(404).json({ flag: false });
    return res.json({ flag: true, lat: driver.driverLat, lng: driver.driverLng, name: driver.driverName });
  } catch (err) {
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Admin: Reports -------------------- */
app.get("/admin/reports", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });

    const [totalUsers, totalDrivers, totalTrips, totalBookings, payments, feedbacks] = await Promise.all([
      userModel.countDocuments(),
      taxiDriverModel.countDocuments(),
      tripModel.countDocuments(),
      bookingModel.countDocuments(),
      paymentModel.find({ paymentStatus: "success" }).select("amount"),
      feedbackModel.find().select("rating"),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const avgRating = feedbacks.length
      ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length).toFixed(2)
      : 0;

    return res.json({
      totalUsers,
      totalDrivers,
      totalTrips,
      totalBookings,
      totalRevenue: totalRevenue.toFixed(3),
      avgRating,
      totalFeedbacks: feedbacks.length,
    });
  } catch (err) {
    console.error("admin/reports error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Admin: Flagged Drivers (>10 one-star reviews) -------------------- */
app.get("/admin/flagged-drivers", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });

    const oneStarFeedbacks = await feedbackModel.find({ rating: 1, driverId: { $exists: true, $ne: null } }).lean();

    const counts = {};
    for (const f of oneStarFeedbacks) {
      const id = f.driverId?.toString();
      if (id) counts[id] = (counts[id] || 0) + 1;
    }

    const flagged = Object.entries(counts)
      .filter(([, count]) => count > 10)
      .map(([id]) => id);

    return res.json({ flaggedDriverIds: flagged });
  } catch (err) {
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Admin: Driver Feedback -------------------- */
app.get("/admin/driver-feedback/:driverId", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });
    const feedbacks = await feedbackModel.find({ driverId: req.params.driverId }).lean();
    return res.json({ feedbacks });
  } catch (err) {
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Chat: Mark Messages as Read -------------------- */
app.patch("/chat/read/:user1/:user2", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });
    await ChatModel.updateMany(
      { senderId: req.params.user2, receiverId: req.params.user1, isRead: false },
      { isRead: true }
    );
    return res.json({ flag: true });
  } catch (err) {
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- User: Update Online Status -------------------- */
app.patch("/users/online/:userId", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });
    const { isOnline } = req.body;
    await userModel.findByIdAndUpdate(req.params.userId, {
      isOnline,
      lastSeen: isOnline ? undefined : new Date(),
    });
    return res.json({ flag: true });
  } catch (err) {
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- User: Get Online Status -------------------- */
app.get("/users/online/:userId", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });
    const user = await userModel.findById(req.params.userId).select("isOnline lastSeen userName");
    if (!user) return res.status(404).json({ flag: false });
    return res.json({ flag: true, isOnline: user.isOnline, lastSeen: user.lastSeen, name: user.userName });
  } catch (err) {
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Health Check -------------------- */
app.get("/", (req, res) => {
  res.send("Travel Buddy backend is running");
});

/* -------------------- Start Server -------------------- */
const PORT = process.env.PORT || 7500;
const MONGO_URI = process.env.MONGODB_URI;

/* -------------------- Notifications -------------------- */
app.get("/notifications/:email", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });
    const notifications = await notificationModel
      .find({ recipientEmail: decodeURIComponent(req.params.email) })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json({ notifications });
  } catch (err) {
    console.error("get notifications error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

app.patch("/notifications/read/:id", async (req, res) => {
  try {
    await notificationModel.findByIdAndUpdate(req.params.id, { isRead: true });
    return res.json({ flag: true });
  } catch (err) {
    console.error("read notification error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

app.patch("/notifications/read-all/:email", async (req, res) => {
  try {
    await notificationModel.updateMany(
      { recipientEmail: decodeURIComponent(req.params.email), isRead: false },
      { isRead: true }
    );
    return res.json({ flag: true });
  } catch (err) {
    console.error("read-all notifications error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

app.delete("/notifications/clear/:email", async (req, res) => {
  try {
    await notificationModel.deleteMany({ recipientEmail: decodeURIComponent(req.params.email) });
    return res.json({ flag: true });
  } catch (err) {
    console.error("clear notifications error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

/* -------------------- Admin: Send Custom Notification -------------------- */
app.post("/admin/notify", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ serverMsg: "Database not connected" });

    const { target, email, title, body } = req.body;
    if (!title || !body)
      return res.status(400).json({ flag: false, serverMsg: "Title and message are required" });

    let recipients = [];

    if (target === "all_users") {
      const users = await userModel.find({}).select("userEmail");
      recipients = users.map((u) => u.userEmail);
    } else if (target === "all_drivers") {
      const drivers = await taxiDriverModel.find({}).select("driverEmail");
      recipients = drivers.map((d) => d.driverEmail);
    } else if (target === "specific" && email) {
      recipients = [email];
    } else {
      return res.status(400).json({ flag: false, serverMsg: "Invalid target or missing email" });
    }

    for (const recipientEmail of recipients) {
      await pushNotification({ recipientEmail, type: "admin_message", title, body });
    }

    return res.json({ flag: true, serverMsg: `Notification sent to ${recipients.length} recipient(s)` });
  } catch (err) {
    console.error("admin/notify error:", err);
    return res.status(500).json({ serverMsg: "Server error" });
  }
});

async function startServer() {
  try {
    if (!MONGO_URI) {
      console.error(
        "❌ MONGODB_URI environment variable is not set.\n" +
        "   Local: put it in .env\n" +
        "   Render: add it under your service's Environment tab.\n"
      );
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ Database Connected");

    // Bind to 0.0.0.0 so the server is reachable from outside the container
    // (Render, Docker, Heroku, etc. all require this — localhost-only won't work).
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup Error:", err);
    process.exit(1);
  }
}

startServer();
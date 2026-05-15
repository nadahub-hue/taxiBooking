import express from "express";
import {
  verifyDriverByAdmin,
} from "../controllers/driverController.js";

const router = express.Router();

router.patch("/verifyDriver/:driverId", verifyDriverByAdmin);

export default router;
 
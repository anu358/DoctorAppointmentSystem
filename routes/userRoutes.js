const express = require("express");
const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController, // ✅ fixed spelling
  bookAppointmentController, // ✅ also corrected name here
  bookingAvailabilityController,
  userAppointmentsController,
} = require("../controllers/userCtrl");

const authMiddleware = require("../middlewares/authMiddleware");

// Router object
const router = express.Router();

// Login
router.post("/login", loginController);

// Register
router.post("/register", registerController);

// Auth
router.post("/getUserData", authMiddleware, authController);

// Apply Doctor
router.post("/apply-doctor", authMiddleware, applyDoctorController);

// Notifications
router.post(
  "/get-all-notification",
  authMiddleware,
  getAllNotificationController
);
router.post(
  "/delete-all-notification",
  authMiddleware,
  deleteAllNotificationController
);

// Get all doctors
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController); // ✅

//Book appointment
router.post("/book-appointment", authMiddleware, bookAppointmentController); // ✅

//Check availability
router.post(
  "/booking-availbility",
  authMiddleware,
  bookingAvailabilityController
);

// Get user appointments
router.get("/user-appointments", authMiddleware, userAppointmentsController);

module.exports = router;

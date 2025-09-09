const express = require("express");
const {
  applyDoctorController,
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
} = require("../controllers/doctorCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Apply as Doctor
router.post("/apply-doctor", authMiddleware, applyDoctorController);

// Get Doctor Info
router.post("/getDoctorInfo", authMiddleware, getDoctorInfoController);

// Update Doctor Profile
router.post("/updateProfile", authMiddleware, updateProfileController);

// Get Doctor By ID
router.post("/getDoctorById", authMiddleware, getDoctorByIdController);

// Get Appointments
router.get(
  "/doctor-appointments",
  authMiddleware,
  doctorAppointmentsController
);

// Update Appointment Status
router.post("/update-status", authMiddleware, updateStatusController);

module.exports = router;

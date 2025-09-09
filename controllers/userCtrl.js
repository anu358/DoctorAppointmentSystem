const userModel = require("../models/userModels");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");

// REGISTER
const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new userModel({ ...req.body, password: hashedPassword });
    await newUser.save();

    res.status(201).send({ message: "Register success", success: true });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).send({ message: "Register failed", success: false, error });
  }
};

// LOGIN
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid credentials", success: false });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).send({
      message: "Login successful",
      success: true,
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send({ message: "Login failed", success: false, error });
  }
};

// AUTH (Protected Route)
const authController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select("-password");
    if (!user) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }
    res.status(200).send({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).send({
      message: "Auth error",
      success: false,
      error,
    });
  }
};

// APPLY DOCTOR
const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = new doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();

    const adminUser = await userModel.findOne({ isAdmin: true });
    adminUser.notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
      data: {
        doctorId: newDoctor._id,
        name: `${newDoctor.firstName} ${newDoctor.lastName}`,
        onClickPath: "/admin/doctors",
      },
    });
    await adminUser.save();

    res.status(201).send({
      success: true,
      message: "Doctor account applied successfully",
    });
  } catch (error) {
    console.error("Apply Doctor Error:", error);
    res.status(500).send({
      success: false,
      message: "Apply Doctor failed",
      error,
    });
  }
};

// NOTIFICATIONS
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    user.seenNotification.push(...user.notification);
    user.notification = [];
    await user.save();

    res.status(200).send({
      success: true,
      message: "All notifications marked as read",
      data: user,
    });
  } catch (error) {
    console.error("Get Notification Error:", error);
    res.status(500).send({
      success: false,
      message: "Error in getting notifications",
      error,
    });
  }
};

const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    user.notification = [];
    user.seenNotification = [];
    await user.save();

    res.status(200).send({
      success: true,
      message: "Notifications cleared successfully",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    res.status(500).send({
      success: false,
      message: "Error deleting notifications",
      error,
    });
  }
};

// GET ALL DOCTORS
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Doctors fetched successfully",
      data: doctors,
    });
  } catch (error) {
    console.error("Get Doctors Error:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching doctors",
      error,
    });
  }
};

// BOOK APPOINTMENT
const bookAppointmentController = async (req, res) => {
  try {
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    req.body.status = "pending";

    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();

    const doctor = await userModel.findById(req.body.doctorInfo.userId);
    doctor.notification.push({
      type: "new-appointment-request",
      message: `New appointment request from ${req.body.userInfo.name}`,
      onClickPath: "/user/appointments",
    });
    await doctor.save();

    res.status(200).send({
      success: true,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    console.error("Book Appointment Error:", error);
    res.status(500).send({
      success: false,
      message: "Booking failed",
      error,
    });
  }
};

// CHECK AVAILABILITY
const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const time = moment(req.body.time, "HH:mm").toISOString();

    const fromTime = moment(time).subtract(1, "hours").toISOString();
    const toTime = moment(time).add(1, "hours").toISOString();

    const appointment = await appointmentModel.findOne({
      doctorId: req.body.doctorId,
      date,
      time: { $gte: fromTime, $lte: toTime },
    });

    if (appointment) {
      return res.status(200).send({
        success: false,
        message: "Appointment not available at this time",
      });
    }

    res.status(200).send({
      success: true,
      message: "Appointment available",
    });
  } catch (error) {
    console.error("Availability Check Error:", error);
    res.status(500).send({
      success: false,
      message: "Availability check failed",
      error,
    });
  }
};

// USER APPOINTMENTS
const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId,
    });
    res.status(200).send({
      success: true,
      message: "User appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    console.error("Get Appointments Error:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching appointments",
      error,
    });
  }
};

module.exports = {
  registerController,
  loginController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController,
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentsController,
};

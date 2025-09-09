const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");

// ================= APPLY DOCTOR =================
const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = new doctorModel({
      ...req.body,
      status: "pending",
    });

    await newDoctor.save();

    const adminUser = await userModel.findOne({ isAdmin: true });

    adminUser.notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a Doctor Account`,
      data: {
        doctorId: newDoctor._id,
        name: `${newDoctor.firstName} ${newDoctor.lastName}`,
        onClickPath: "/admin/doctors",
      },
    });

    await adminUser.save();

    res.status(201).send({
      success: true,
      message: "Doctor account applied successfully!",
    });
  } catch (error) {
    console.log("❌ Error in applyDoctorController:", error.message);
    res.status(500).send({
      success: false,
      message: "Error while applying for doctor",
      error: error.message,
    });
  }
};

// ================= GET DOCTOR INFO =================
const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId }); // ✅ req.user.id now works
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Doctor data fetched successfully",
      data: doctor,
    });
  } catch (error) {
    console.log("❌ Error in getDoctorInfoController:", error.message);
    res.status(500).send({
      success: false,
      message: "Error fetching doctor details",
      error: error.message,
    });
  }
};

// ================= UPDATE PROFILE =================
const updateProfileController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.body.userId }, // ✅ req.user.id now available
      req.body,
      { new: true }
    );
    res.status(201).send({
      success: true,
      message: "Doctor profile updated",
      data: doctor,
    });
  } catch (error) {
    console.log("❌ Error in updateProfileController:", error.message);
    res.status(500).send({
      success: false,
      message: "Doctor profile update failed",
      error: error.message,
    });
  }
};

// ================= GET DOCTOR BY ID =================
const getDoctorByIdController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId }); // ✅ fixed
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Doctor info fetched successfully",
      data: doctor,
    });
  } catch (error) {
    console.log("❌ Error in getDoctorByIdController:", error.message);
    res.status(500).send({
      success: false,
      message: "Error fetching doctor info",
      error: error.message,
    });
  }
};

// ================= GET DOCTOR APPOINTMENTS =================
const doctorAppointmentsController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId }); // ✅
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    const appointments = await appointmentModel.find({
      doctorId: doctor._id,
    });

    res.status(200).send({
      success: true,
      message: "Appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    console.log("❌ Error in doctorAppointmentsController:", error.message);
    res.status(500).send({
      success: false,
      message: "Error fetching appointments",
      error: error.message,
    });
  }
};

// ================= UPDATE APPOINTMENT STATUS =================
const updateStatusController = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;

    const appointment = await appointmentModel.findByIdAndUpdate(
      appointmentsId,
      { status },
      { new: true }
    );

    const user = await userModel.findById(appointment.userId);
    user.notification.push({
      type: "status-updated",
      message: `Your appointment status has been updated to: ${status}`,
      onClickPath: "/doctor-appointments",
    });

    await user.save();

    res.status(200).send({
      success: true,
      message: "Appointment status updated",
    });
  } catch (error) {
    console.log("❌ Error in updateStatusController:", error.message);
    res.status(500).send({
      success: false,
      message: "Error updating appointment status",
      error: error.message,
    });
  }
};

module.exports = {
  applyDoctorController,
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
};

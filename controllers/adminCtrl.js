const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");

// ✅ Get all users
const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).send({
      success: true,
      message: "Users data list",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while fetching users",
      error,
    });
  }
};

// ✅ Get all doctors
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    res.status(200).send({
      success: true,
      message: "Doctors data list",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting doctors data",
      error,
    });
  }
};

// ✅ Change doctor account status (approve/reject)
const changeAccountStatusController = async (req, res) => {
  try {
    const { doctorId, status } = req.body;

    // Ensure we get the updated doctor document
    const doctor = await doctorModel.findByIdAndUpdate(
      doctorId,
      { status },
      { new: true } // 🔧 Fix: get updated doctor with userId
    );

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    const user = await userModel.findById(doctor.userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // 🔧 Fix: correct spelling and schema field
    user.notification.push({
      type: "doctor-account-request-updated",
      message: `Your Doctor Account Request Has Been ${status}`,
      onClickPath: "/notification",
    });

    user.isDoctor = status === "approved" ? true : false;
    await user.save();

    res.status(201).send({
      success: true,
      message: "Account Status Updated Successfully",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Account Status",
      error,
    });
  }
};

module.exports = {
  getAllDoctorsController,
  getAllUsersController,
  changeAccountStatusController,
};

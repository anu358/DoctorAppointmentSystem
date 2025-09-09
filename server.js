const express = require("express");
const colors = require("colors");
const morgan = require("morgan"); // ✅ fixed typo
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

// ✅ Load environment variables
dotenv.config();

// ✅ MongoDB connection
connectDB();

// Create app
const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev")); // ✅ fixed typo

// Routes
app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/doctor", require("./routes/doctorRoutes"));
//static files
app.use(
  express.static(path.join(__dirname, "./client/build"))
);
app.get("*", function (req, res) {
  res.sendFile(
    path.join(__dirname, "./client/build/index.html")
  );
});

// ✅ Correct environment variable usage
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || "development";

// Listen
app.listen(PORT, () => {
  console.log(
    `Server Running in ${NODE_ENV} Mode on port ${PORT}`.bgCyan.white
  );
});

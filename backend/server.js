const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const carRoutes = require("./routes/carRoutes");

const serviceRoutes = require("./routes/serviceRoutes");

const bookingRoutes = require("./routes/bookingRoutes");

const adminRoutes = require("./routes/adminRoutes");

const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.get("/", (req, res) => {
    res.send("CDAC Car Service Backend is running!");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
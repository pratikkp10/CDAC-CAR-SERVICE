const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const carRoutes = require("./routes/carRoutes");

const serviceRoutes = require("./routes/serviceRoutes");

const bookingRoutes = require("./routes/bookingRoutes");

const adminRoutes = require("./routes/adminRoutes");

const stationRoutes = require("./routes/stationRoutes");

const stationServicePriceRoutes = require("./routes/stationServicePriceRoutes");

const receiptRoutes = require("./routes/receiptRoutes");

const messageRoutes = require("./routes/messageRoutes");

const bookingHistoryRoutes = require("./routes/bookingHistoryRoutes");

const superAdminRoutes = require("./routes/superAdminRoutes");
const adminManagementRoutes = require("./routes/adminManagementRoutes");
const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/station-service-prices", stationServicePriceRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/booking-history", bookingHistoryRoutes);

app.use("/api/superadmin", superAdminRoutes);
app.use("/api/admin-management", adminManagementRoutes);
app.get("/", (req, res) => {
    res.send("CDAC Car Service Backend is running!");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
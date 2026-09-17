const express = require("express");

const {
    getAllBookings,
    updateBookingStatus,
    getAllUsers,
    getAllCars,
    addService,
    updateService,
    deleteService                   
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/bookings", authMiddleware, adminMiddleware, getAllBookings);
router.put("/bookings/:id/status", authMiddleware, adminMiddleware, updateBookingStatus);
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.get("/cars", authMiddleware, adminMiddleware, getAllCars);
router.post("/services", authMiddleware, adminMiddleware, addService);
router.put("/services/:id", authMiddleware, adminMiddleware, updateService);
router.delete("/services/:id", authMiddleware, adminMiddleware, deleteService);
module.exports = router;
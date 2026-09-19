const express = require("express");

const {
    getSystemStats,
    getAllUsers,
    updateUserRole,
    getAllBookings
} = require("../controllers/superAdminController");

const authMiddleware = require("../middleware/authMiddleware");
const superAdminMiddleware = require("../middleware/superAdminMiddleware");

const router = express.Router();

// Get system statistics
router.get(
    "/stats",
    authMiddleware,
    superAdminMiddleware,
    getSystemStats
);

// Get all users
router.get(
    "/users",
    authMiddleware,
    superAdminMiddleware,
    getAllUsers
);

// Change a user's role
router.put(
    "/users/:id/role",
    authMiddleware,
    superAdminMiddleware,
    updateUserRole
);

// Get every booking in the system
router.get(
    "/bookings",
    authMiddleware,
    superAdminMiddleware,
    getAllBookings
);

module.exports = router;
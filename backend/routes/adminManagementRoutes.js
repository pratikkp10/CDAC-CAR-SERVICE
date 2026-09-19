const express = require("express");

const {
    getAllAdmins,
    createAdmin,
    updateAdmin,
    updateAdminStatus,
    deleteAdmin
} = require("../controllers/adminManagementController");

const authMiddleware = require("../middleware/authMiddleware");
const superAdminMiddleware = require("../middleware/superAdminMiddleware");

const router = express.Router();

// Get all admin accounts
router.get(
    "/",
    authMiddleware,
    superAdminMiddleware,
    getAllAdmins
);

// Create a new admin
router.post(
    "/",
    authMiddleware,
    superAdminMiddleware,
    createAdmin
);

// Update admin details
router.put(
    "/:id",
    authMiddleware,
    superAdminMiddleware,
    updateAdmin
);

// Activate or deactivate an admin
router.patch(
    "/:id/status",
    authMiddleware,
    superAdminMiddleware,
    updateAdminStatus
);

// Delete an admin
router.delete(
    "/:id",
    authMiddleware,
    superAdminMiddleware,
    deleteAdmin
);

module.exports = router;
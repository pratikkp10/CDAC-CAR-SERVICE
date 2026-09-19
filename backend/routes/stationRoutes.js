const express = require("express");

const {
    getAllStations,
    getStationById,
    createStation,
    updateStation,
    deactivateStation
} = require("../controllers/stationController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Publicly accessible station information
router.get("/", getAllStations);
router.get("/:id", getStationById);

// Admin and Super Admin operations
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    createStation
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    updateStation
);

router.patch(
    "/:id/deactivate",
    authMiddleware,
    adminMiddleware,
    deactivateStation
);

module.exports = router;
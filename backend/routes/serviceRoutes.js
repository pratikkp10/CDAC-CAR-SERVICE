const express = require("express");

const {
    getAllServices,
    getServiceById,
    getServicesByStation
} = require("../controllers/serviceController");

const router = express.Router();

router.get("/", getAllServices);

// Get services available at a specific station
router.get("/station/:stationId", getServicesByStation);

// Get a service by ID
router.get("/:id", getServiceById);

module.exports = router;
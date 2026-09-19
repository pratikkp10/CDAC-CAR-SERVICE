const express = require("express");

const {
    addOrUpdateStationServicePrice,
    getStationServicePrices,
    deactivateStationServicePrice
} = require("../controllers/stationServicePriceController");

const router = express.Router();

// Add or update a station-specific service price
router.post("/", addOrUpdateStationServicePrice);

// Get prices for a station
router.get("/:stationId", getStationServicePrices);

// Deactivate a service price
router.patch("/:id/deactivate", deactivateStationServicePrice);

module.exports = router;
const express = require("express");

const {
    getBookingHistory
} = require("../controllers/bookingHistoryController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/:bookingId",
    authMiddleware,
    getBookingHistory
);

module.exports = router;
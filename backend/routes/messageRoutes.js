const express = require("express");

const {
    sendMessage,
    getBookingMessages,
    markMessageAsRead
} = require("../controllers/messageController");

// Use the same middleware import used in carRoutes.js
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Send a message
router.post("/", authMiddleware, sendMessage);

// Get messages for a booking
router.get("/booking/:bookingId", authMiddleware, getBookingMessages);

// Mark a message as read
router.patch("/:id/read", authMiddleware, markMessageAsRead);

module.exports = router;
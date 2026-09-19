const express = require("express");

const {
    createReceipt,
    getReceiptByBooking,
    updatePaymentStatus
} = require("../controllers/receiptController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Generate receipt
router.post(
    "/:bookingId",
    authMiddleware,
    adminMiddleware,
    createReceipt
);

// Get receipt by booking ID
router.get(
    "/booking/:bookingId",
    authMiddleware,
    getReceiptByBooking
);

// Update payment status
router.patch(
    "/:receiptId/payment-status",
    authMiddleware,
    adminMiddleware,
    updatePaymentStatus
);

module.exports = router;
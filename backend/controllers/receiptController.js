const db = require("../config/db");

// Generate a receipt for a completed booking
const createReceipt = (req, res) => {
    const bookingId = req.params.bookingId;

    const bookingSql = `
        SELECT
            b.id AS bookingId,
            b.status,
            COALESCE(ssp.price, s.price) AS amount
        FROM bookings b
        JOIN services s
            ON b.service_id = s.id
        LEFT JOIN station_service_prices ssp
            ON b.service_id = ssp.serviceId
            AND b.stationId = ssp.stationId
            AND ssp.isActive = 1
        WHERE b.id = ?
    `;

    db.query(bookingSql, [bookingId], (err, bookings) => {
        if (err) {
            console.error("Error fetching booking:", err);
            return res.status(500).json({
                message: "Error fetching booking"
            });
        }

        if (bookings.length === 0) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        const booking = bookings[0];

        if (booking.status !== "completed") {
            return res.status(400).json({
                message: "Receipt can only be generated for completed bookings"
            });
        }

        const existingReceiptSql = `
            SELECT *
            FROM receipts
            WHERE bookingId = ?
        `;

        db.query(
            existingReceiptSql,
            [bookingId],
            (receiptErr, existingReceipts) => {
                if (receiptErr) {
                    return res.status(500).json({
                        message: "Error checking existing receipt"
                    });
                }

                if (existingReceipts.length > 0) {
                    return res.status(200).json({
                        message: "Receipt already exists",
                        receipt: existingReceipts[0]
                    });
                }

                const insertReceiptSql = `
                    INSERT INTO receipts
                    (bookingId, amount, paymentStatus, paymentMethod)
                    VALUES (?, ?, ?, ?)
                `;

                db.query(
                    insertReceiptSql,
                    [
                        bookingId,
                        booking.amount,
                        "pending",
                        "cash"
                    ],
                    (insertErr, result) => {
                        if (insertErr) {
                            console.error(
                                "Error creating receipt:",
                                insertErr
                            );

                            return res.status(500).json({
                                message: "Error creating receipt"
                            });
                        }

                        return res.status(201).json({
                            message: "Receipt generated successfully",
                            receiptId: result.insertId,
                            bookingId,
                            amount: booking.amount,
                            paymentStatus: "pending",
                            paymentMethod: "cash"
                        });
                    }
                );
            }
        );
    });
};

// Get receipt by booking ID
// Get receipt by booking ID
const getReceiptByBooking = (req, res) => {
    const bookingId = req.params.bookingId;
    const userId = req.user.id;
    const userRole = req.user.role;

    const sql = `
        SELECT
            r.*
        FROM receipts r
        JOIN bookings b
            ON r.bookingId = b.id
        WHERE r.bookingId = ?
        AND (
            b.user_id = ?
            OR ? IN ('admin', 'superadmin')
        )
    `;

    db.query(
        sql,
        [bookingId, userId, userRole],
        (err, results) => {
            if (err) {
                console.error("Error fetching receipt:", err);

                return res.status(500).json({
                    message: "Error fetching receipt"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Receipt not found"
                });
            }

            return res.status(200).json({
                receipt: results[0]
            });
        }
    );
};const updatePaymentStatus = (req, res) => {
    const receiptId = req.params.receiptId;
    const { paymentStatus, paymentMethod } = req.body;

    const validStatuses = [
        "pending",
        "paid",
        "failed",
        "refunded"
    ];

    const validMethods = [
        "cash",
        "upi",
        "card",
        "online"
    ];

    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
        return res.status(400).json({
            message: "Invalid payment status"
        });
    }

    if (
        paymentMethod &&
        !validMethods.includes(paymentMethod)
    ) {
        return res.status(400).json({
            message: "Invalid payment method"
        });
    }

    let sql;
    let values;

    if (paymentMethod) {
        sql = `
            UPDATE receipts
            SET paymentStatus = ?, paymentMethod = ?
            WHERE id = ?
        `;

        values = [
            paymentStatus,
            paymentMethod,
            receiptId
        ];
    } else {
        sql = `
            UPDATE receipts
            SET paymentStatus = ?
            WHERE id = ?
        `;

        values = [
            paymentStatus,
            receiptId
        ];
    }

    db.query(sql, values, (error, result) => {
        if (error) {
            console.error("Error updating payment status:", error);

            return res.status(500).json({
                message: "Error updating payment status"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Receipt not found"
            });
        }

        res.status(200).json({
            message: "Payment status updated successfully"
        });
    });
};

module.exports = {
    createReceipt,
    getReceiptByBooking,
    updatePaymentStatus
};
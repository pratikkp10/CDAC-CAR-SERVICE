const db = require("../config/db");

// Send a message
const sendMessage = (req, res) => {
    const senderId = req.user.id;

    const {
        receiverId,
        bookingId,
        message
    } = req.body;

    if (!receiverId || !message) {
        return res.status(400).json({
            message: "receiverId and message are required"
        });
    }

    const sql = `
        INSERT INTO messages
        (senderId, receiverId, bookingId, message)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [senderId, receiverId, bookingId || null, message],
        (err, result) => {
            if (err) {
                console.error("Error sending message:", err);

                return res.status(500).json({
                    message: "Error sending message"
                });
            }

            res.status(201).json({
                message: "Message sent successfully",
                messageId: result.insertId
            });
        }
    );
};

// Get messages related to a booking
const getBookingMessages = (req, res) => {
    const bookingId = req.params.bookingId;

    const sql = `
        SELECT *
        FROM messages
        WHERE bookingId = ?
        ORDER BY createdAt ASC
    `;

    db.query(sql, [bookingId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching messages"
            });
        }

        res.status(200).json({
            messages: results
        });
    });
};

// Mark a message as read
const markMessageAsRead = (req, res) => {
    const messageId = req.params.id;
    const userId = req.user.id;

    const sql = `
        UPDATE messages
        SET isRead = 1
        WHERE id = ? AND receiverId = ?
    `;

    db.query(sql, [messageId, userId], (err, result) => {
        if (err) {
            console.error("Error marking message as read:", err);

            return res.status(500).json({
                message: "Error marking message as read"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Message not found or you are not the receiver"
            });
        }

        res.status(200).json({
            message: "Message marked as read successfully"
        });
    });
};

module.exports = {
    sendMessage,
    getBookingMessages,
    markMessageAsRead
};
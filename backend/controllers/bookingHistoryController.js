const db = require("../config/db");

const getBookingHistory = (req, res) => {
    const bookingId = req.params.bookingId;
    const userId = req.user.id;
    const userRole = req.user.role;

    let sql = `
        SELECT
            h.id,
            h.bookingId,
            h.status,
            h.notes,
            h.createdAt,
            u.name AS changedByName
        FROM booking_status_history h
        LEFT JOIN users u
            ON h.changedBy = u.id
        INNER JOIN bookings b
            ON h.bookingId = b.id
        WHERE h.bookingId = ?
    `;

    const params = [bookingId];

    if (userRole !== "admin" && userRole !== "superadmin") {
        sql += ` AND b.user_id = ?`;
        params.push(userId);
    }

    sql += ` ORDER BY h.createdAt ASC`;

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Error fetching booking history:", err);

            return res.status(500).json({
                message: "Error fetching booking history"
            });
        }

        res.status(200).json({
            bookingId,
            history: results
        });
    });
};

module.exports = {
    getBookingHistory
};
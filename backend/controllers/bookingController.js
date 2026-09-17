const db = require("../config/db");

const createBooking = (req, res) => {
    const { car_id, service_id, booking_date } = req.body;

    if (!car_id || !service_id || !booking_date) {
        return res.status(400).json({
            message: "Car, service and booking date are required"
        });
    }

    const user_id = req.user.id;

    const sql = `
        INSERT INTO bookings
        (user_id, car_id, service_id, booking_date)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [user_id, car_id, service_id, booking_date],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error creating booking"
                });
            }

            res.status(201).json({
                message: "Booking created successfully",
                bookingId: result.insertId
            });
        }
    );
};
const getMyBookings = (req, res) => {
    const user_id = req.user.id;

    const sql = `
        SELECT
            bookings.id,
            bookings.booking_date,
            bookings.status,
            cars.brand,
            cars.model,
            cars.registration_number,
            services.name AS service_name,
            services.price
        FROM bookings
        JOIN cars ON bookings.car_id = cars.id
        JOIN services ON bookings.service_id = services.id
        WHERE bookings.user_id = ?
        ORDER BY bookings.booking_date DESC
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching bookings"
            });
        }

        res.status(200).json({
            bookings: results
        });
    });
};
const updateBooking = (req, res) => {
    const booking_id = req.params.id;
    const user_id = req.user.id;

    const { booking_date } = req.body;

    if (!booking_date) {
        return res.status(400).json({
            message: "Booking date is required"
        });
    }

    const sql = `
        UPDATE bookings
        SET booking_date = ?
        WHERE id = ? AND user_id = ?
    `;

    db.query(
        sql,
        [booking_date, booking_id, user_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error updating booking"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Booking not found"
                });
            }

            res.status(200).json({
                message: "Booking updated successfully"
            });
        }
    );
};
const cancelBooking = (req, res) => {
    const booking_id = req.params.id;
    const user_id = req.user.id;

    const sql = `
        UPDATE bookings
        SET status = 'cancelled'
        WHERE id = ? AND user_id = ?
    `;

    db.query(
        sql,
        [booking_id, user_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error cancelling booking"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Booking not found"
                });
            }

            res.status(200).json({
                message: "Booking cancelled successfully"
            });
        }
    );
};

module.exports = {
    createBooking,
    getMyBookings,
    updateBooking,
    cancelBooking
};
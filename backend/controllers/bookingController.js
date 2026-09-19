const db = require("../config/db");

const createBooking = (req, res) => {
    const {
        car_id,
        service_id,
        stationId,
        booking_date
    } = req.body;

    if (!car_id || !service_id || !stationId || !booking_date) {
        return res.status(400).json({
            message: "Car, service, station and booking date are required"
        });
    }

    const user_id = req.user.id;

    // Verify that the selected car belongs to the logged-in user
    const carOwnershipSql = `
        SELECT id
        FROM cars
        WHERE id = ? AND user_id = ?
    `;

    db.query(
        carOwnershipSql,
        [car_id, user_id],
        (carError, carResults) => {
            if (carError) {
                console.error(
                    "Error verifying car ownership:",
                    carError
                );

                return res.status(500).json({
                    message: "Error verifying car ownership"
                });
            }

            if (carResults.length === 0) {
                return res.status(403).json({
                    message: "You can only book a service for your own car"
                });
            }

            // Verify that the selected service exists
            const serviceSql = `
                SELECT id
                FROM services
                WHERE id = ?
            `;

            db.query(
                serviceSql,
                [service_id],
                (serviceError, serviceResults) => {
                    if (serviceError) {
                        return res.status(500).json({
                            message: "Error verifying service"
                        });
                    }

                    if (serviceResults.length === 0) {
                        return res.status(404).json({
                            message: "Service not found"
                        });
                    }

                    // Verify that the selected station exists
                    const stationSql = `
                        SELECT id
                        FROM stations
                        WHERE id = ?
                    `;

                    db.query(
                        stationSql,
                        [stationId],
                        (stationError, stationResults) => {
                            if (stationError) {
                                return res.status(500).json({
                                    message: "Error verifying service station"
                                });
                            }

                            if (stationResults.length === 0) {
                                return res.status(404).json({
                                    message: "Service station not found"
                                });
                            }

                            // Create the booking after all validations
                            const bookingSql = `
                                INSERT INTO bookings
                                (
                                    user_id,
                                    car_id,
                                    service_id,
                                    stationId,
                                    booking_date
                                )
                                VALUES (?, ?, ?, ?, ?)
                            `;

                            db.query(
                                bookingSql,
                                [
                                    user_id,
                                    car_id,
                                    service_id,
                                    stationId,
                                    booking_date
                                ],
                                (bookingError, result) => {
                                    if (bookingError) {
                                        console.error(
                                            "Error creating booking:",
                                            bookingError
                                        );

                                        return res.status(500).json({
                                            message: "Error creating booking"
                                        });
                                    }

                                    return res.status(201).json({
                                        message: "Booking created successfully",
                                        bookingId: result.insertId
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
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

    const findBookingSql = `
        SELECT status
        FROM bookings
        WHERE id = ? AND user_id = ?
    `;

    db.query(
        findBookingSql,
        [booking_id, user_id],
        (findError, bookings) => {
            if (findError) {
                return res.status(500).json({
                    message: "Error checking booking"
                });
            }

            if (bookings.length === 0) {
                return res.status(404).json({
                    message: "Booking not found"
                });
            }

            const currentStatus = bookings[0].status;

            if (
                currentStatus === "completed" ||
                currentStatus === "cancelled"
            ) {
                return res.status(400).json({
                    message: "Completed or cancelled bookings cannot be modified"
                });
            }

            const updateSql = `
                UPDATE bookings
                SET booking_date = ?
                WHERE id = ? AND user_id = ?
            `;

            db.query(
                updateSql,
                [booking_date, booking_id, user_id],
                (updateError) => {
                    if (updateError) {
                        return res.status(500).json({
                            message: "Error updating booking"
                        });
                    }

                    res.status(200).json({
                        message: "Booking updated successfully"
                    });
                }
            );
        }
    );
};
const cancelBooking = (req, res) => {
    const booking_id = req.params.id;
    const user_id = req.user.id;

    const sql = `
        UPDATE bookings
        SET status = 'cancelled'
        WHERE id = ?
        AND user_id = ?
        AND status NOT IN ('completed', 'cancelled')
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
                return res.status(400).json({
                    message: "Booking cannot be cancelled or was not found"
                });
            }

            res.status(200).json({
                message: "Booking cancelled successfully"
            });
        }
    );
};const getMyBookings = (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT
            b.*,
            c.brand AS car_brand,
            c.model AS car_model,
            c.registration_number,
            s.name AS service_name
        FROM bookings b
        LEFT JOIN cars c ON b.car_id = c.id
        LEFT JOIN services s ON b.service_id = s.id
        WHERE b.user_id = ?
        ORDER BY b.id DESC
    `;

    db.query(sql, [userId], (error, results) => {
        if (error) {
            console.error("Error fetching customer bookings:", error);

            return res.status(500).json({
                message: "Error fetching bookings"
            });
        }

        res.status(200).json(results);
    });
};

module.exports = {
    createBooking,
    getMyBookings,
    updateBooking,
    cancelBooking
};
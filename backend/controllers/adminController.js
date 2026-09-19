const db = require("../config/db");

// Get all bookings
const getAllBookings = (req, res) => {
    const sql = `
        SELECT
            bookings.id,
            bookings.booking_date,
            bookings.status,

            users.name AS customer_name,
            users.email,

            cars.brand,
            cars.model,
            cars.registration_number,

            services.name AS service_name,
            services.price,

            stations.id AS station_id,
            stations.name AS station_name,
            stations.address AS station_address

        FROM bookings

        JOIN users
            ON bookings.user_id = users.id

        JOIN cars
            ON bookings.car_id = cars.id

        JOIN services
            ON bookings.service_id = services.id

        LEFT JOIN stations
            ON bookings.stationId = stations.id

        ORDER BY bookings.booking_date DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching bookings:", err);

            return res.status(500).json({
                message: "Error fetching all bookings"
            });
        }

        res.status(200).json({
            bookings: results
        });
    });
};

const updateBookingStatus = (req, res) => {
    const bookingId = req.params.id;
    const { status } = req.body;

    const validStatuses = [
        "pending",
        "in_progress",
        "completed",
        "cancelled"
    ];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid booking status"
        });
    }

    const updateBookingQuery = `
        UPDATE bookings
        SET status = ?
        WHERE id = ?
    `;

    db.query(
        updateBookingQuery,
        [status, bookingId],
        (updateError, updateResult) => {
            if (updateError) {
                console.error(
                    "Booking status update error:",
                    updateError
                );

                return res.status(500).json({
                    message: updateError.sqlMessage || updateError.message
                });
            }

            if (updateResult.affectedRows === 0) {
                return res.status(404).json({
                    message: "Booking not found"
                });
            }

            if (status !== "completed") {
                return res.status(200).json({
                    message: "Booking status updated successfully"
                });
            }

            const checkReceiptQuery = `
                SELECT id
                FROM receipts
                WHERE bookingId = ?
            `;

            db.query(
                checkReceiptQuery,
                [bookingId],
                (receiptCheckError, receiptRows) => {
                    if (receiptCheckError) {
                        console.error(
                            "Receipt check error:",
                            receiptCheckError
                        );

                        return res.status(500).json({
                            message:
                                receiptCheckError.sqlMessage ||
                                receiptCheckError.message
                        });
                    }

                    if (receiptRows.length > 0) {
                        return res.status(200).json({
                            message:
                                "Booking completed. Receipt already exists."
                        });
                    }

                    const amountQuery = `
                        SELECT
                            COALESCE(ssp.price, s.price, 0) AS amount
                        FROM bookings b
                        JOIN services s
                            ON b.service_id = s.id
                        LEFT JOIN station_service_prices ssp
                            ON ssp.stationId = b.stationId
                            AND ssp.serviceId = b.service_id
                            AND ssp.isActive = 1
                        WHERE b.id = ?
                    `;

                    db.query(
                        amountQuery,
                        [bookingId],
                        (amountError, amountRows) => {
                            if (amountError) {
                                console.error(
                                    "Amount lookup error:",
                                    amountError
                                );

                                return res.status(500).json({
                                    message:
                                        amountError.sqlMessage ||
                                        amountError.message
                                });
                            }

                            if (amountRows.length === 0) {
                                return res.status(404).json({
                                    message:
                                        "Booking details not found for receipt"
                                });
                            }

                            const amount = amountRows[0].amount;

                            const insertReceiptQuery = `
                                INSERT INTO receipts
                                (
                                    bookingId,
                                    amount,
                                    paymentStatus,
                                    paymentMethod
                                )
                                VALUES (?, ?, 'pending', 'cash')
                            `;

                            db.query(
                                insertReceiptQuery,
                                [bookingId, amount],
                                (insertError, insertResult) => {
                                    if (insertError) {
                                        console.error(
                                            "Receipt insertion error:",
                                            insertError
                                        );

                                        return res.status(500).json({
                                            message:
                                                insertError.sqlMessage ||
                                                insertError.message
                                        });
                                    }

                                    return res.status(200).json({
                                        message:
                                            "Booking completed and receipt created successfully",
                                        receiptId: insertResult.insertId,
                                        amount
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
// Get all users
const getAllUsers = (req, res) => {
    const sql = `
        SELECT
            id,
            name,
            email,
            phone,
            role
        FROM users
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching users:", err);

            return res.status(500).json({
                message: "Error fetching users"
            });
        }

        res.status(200).json({
            users: results
        });
    });
};


// Get all cars
const getAllCars = (req, res) => {
    const sql = `
        SELECT
            id,
            user_id,
            brand,
            model,
            registration_number,
            year
        FROM cars
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching cars:", err);

            return res.status(500).json({
                message: "Error fetching cars"
            });
        }

        res.status(200).json({
            cars: results
        });
    });
};


// Add a new service
const addService = (req, res) => {
    const {
        name,
        description,
        price,
        basePrice,
        estimatedDuration
    } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({
            message: "Service name and price are required"
        });
    }

    const numericPrice = Number(price);
    const numericBasePrice =
        basePrice !== undefined ? Number(basePrice) : numericPrice;
    const numericDuration =
        estimatedDuration !== undefined
            ? Number(estimatedDuration)
            : 30;

    if (
        !Number.isFinite(numericPrice) ||
        numericPrice < 0 ||
        !Number.isFinite(numericBasePrice) ||
        numericBasePrice < 0 ||
        !Number.isInteger(numericDuration) ||
        numericDuration <= 0
    ) {
        return res.status(400).json({
            message: "Please provide valid price and duration values"
        });
    }

    const sql = `
        INSERT INTO services
        (name, description, price, basePrice, estimatedDuration)
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
        name.trim(),
        description || null,
        numericPrice,
        numericBasePrice,
        numericDuration
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error adding service:", err);

            return res.status(500).json({
                message: "Error adding service"
            });
        }

        res.status(201).json({
            message: "Service added successfully",
            serviceId: result.insertId
        });
    });
};


// Update an existing service
const updateService = (req, res) => {
    const serviceId = req.params.id;

    const {
        name,
        description,
        price,
        basePrice,
        estimatedDuration,
        isActive
    } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({
            message: "Service name and price are required"
        });
    }

    const numericPrice = Number(price);
    const numericBasePrice =
        basePrice !== undefined ? Number(basePrice) : numericPrice;
    const numericDuration =
        estimatedDuration !== undefined
            ? Number(estimatedDuration)
            : 30;

    if (
        !Number.isFinite(numericPrice) ||
        numericPrice < 0 ||
        !Number.isFinite(numericBasePrice) ||
        numericBasePrice < 0 ||
        !Number.isInteger(numericDuration) ||
        numericDuration <= 0
    ) {
        return res.status(400).json({
            message: "Please provide valid price and duration values"
        });
    }

    let activeValue = 1;

    if (isActive !== undefined) {
        if (
            isActive !== 0 &&
            isActive !== 1 &&
            isActive !== true &&
            isActive !== false
        ) {
            return res.status(400).json({
                message: "Invalid service active status"
            });
        }

        activeValue = isActive === true || isActive === 1 ? 1 : 0;
    }

    const sql = `
        UPDATE services
        SET
            name = ?,
            description = ?,
            price = ?,
            basePrice = ?,
            estimatedDuration = ?,
            isActive = ?
        WHERE id = ?
    `;

    const values = [
        name.trim(),
        description || null,
        numericPrice,
        numericBasePrice,
        numericDuration,
        activeValue,
        serviceId
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating service:", err);

            return res.status(500).json({
                message: "Error updating service"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.status(200).json({
            message: "Service updated successfully"
        });
    });
};


// Safely deactivate a service instead of permanently deleting it
const deleteService = (req, res) => {
    const serviceId = req.params.id;

    const sql = `
        UPDATE services
        SET isActive = 0
        WHERE id = ?
    `;

    db.query(sql, [serviceId], (err, result) => {
        if (err) {
            console.error("Error deactivating service:", err);

            return res.status(500).json({
                message: "Error deactivating service"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.status(200).json({
            message: "Service deactivated successfully"
        });
    });
};

module.exports = {
    getAllBookings,
    updateBookingStatus,
    getAllUsers,
    getAllCars,
    addService,
    updateService,
    deleteService
};
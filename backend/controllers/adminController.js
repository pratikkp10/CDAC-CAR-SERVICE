const db = require("../config/db");
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
            services.price
        FROM bookings   
        JOIN users ON bookings.user_id = users.id
        JOIN cars ON bookings.car_id = cars.id
        JOIN services ON bookings.service_id = services.id
        ORDER BY bookings.booking_date DESC
    `;
    db.query(sql, (err, results) => {
        if (err) {
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
    const booking_id = req.params.id;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            message: "Booking status is required"
        });
    }

    const sql = `
        UPDATE bookings
        SET status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [status, booking_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error updating booking status"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Booking not found"
                });
            }

            res.status(200).json({
                message: "Booking status updated successfully"
            });
        }
    );
};
const getAllUsers = (req, res) => {
    const sql = `
        SELECT id, name, email, phone, role
        FROM users
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching users"
            });
        }

        res.status(200).json({
            users: results
        });
    });
};const getAllCars = (req, res) => {
    const sql = `
        SELECT
            id,
            user_id,
            brand,
            model,
            registration_number
        FROM cars
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching cars"
            });
        }

        res.status(200).json({
            cars: results
        });
    });
};
const addService = (req, res) => {
    const { name, description, price } = req.body;

    if (!name || !price) {
        return res.status(400).json({
            message: "Service name and price are required"
        });
    }

    const sql = `
        INSERT INTO services (name, description, price)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [name, description, price],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error adding service"
                });
            }

            res.status(201).json({
                message: "Service added successfully",
                serviceId: result.insertId
            });
        }
    );
};
const updateService = (req, res) => {
    const service_id = req.params.id;

    const { name, description, price } = req.body;

    if (!name || !price) {
        return res.status(400).json({
            message: "Service name and price are required"
        });
    }

    const sql = `
        UPDATE services
        SET name = ?, description = ?, price = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [name, description, price, service_id],
        (err, result) => {
            if (err) {
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
        }
    );
};
const deleteService = (req, res) => {
    const service_id = req.params.id;

    const sql = "DELETE FROM services WHERE id = ?";

    db.query(sql, [service_id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error deleting service"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.status(200).json({
            message: "Service deleted successfully"
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


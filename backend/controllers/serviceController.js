const db = require("../config/db");

// Get all active services
const getAllServices = (req, res) => {
    const sql = `
        SELECT *
        FROM services
        WHERE isActive = 1
        ORDER BY id ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching services:", err);

            return res.status(500).json({
                message: "Error fetching services"
            });
        }

        res.status(200).json({
            services: results
        });
    });
};


// Get service by ID
const getServiceById = (req, res) => {
    const serviceId = req.params.id;

    const sql = `
        SELECT *
        FROM services
        WHERE id = ?
    `;

    db.query(sql, [serviceId], (err, results) => {
        if (err) {
            console.error("Error fetching service:", err);

            return res.status(500).json({
                message: "Error fetching service"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.status(200).json({
            service: results[0]
        });
    });
};


// Get all active services for a station
// Uses the station-specific price when available.
// Otherwise, it uses the default service price.
const getServicesByStation = (req, res) => {
    const stationId = req.params.stationId;

    const sql = `
        SELECT
            s.*,
            COALESCE(p.price, s.price) AS stationPrice
        FROM services s
        LEFT JOIN station_service_prices p
            ON s.id = p.serviceId
            AND p.stationId = ?
            AND p.isActive = 1
        WHERE s.isActive = 1
        ORDER BY s.id ASC
    `;

    db.query(sql, [stationId], (err, results) => {
        if (err) {
            console.error(
                "Error fetching station services:",
                err
            );

            return res.status(500).json({
                message: "Error fetching station services"
            });
        }

        res.status(200).json({
            services: results
        });
    });
};


module.exports = {
    getAllServices,
    getServiceById,
    getServicesByStation
};
const db = require("../config/db");

// Add or update a service price for a station
const addOrUpdateStationServicePrice = (req, res) => {
    const { stationId, serviceId, price } = req.body;

    if (!stationId || !serviceId || price === undefined) {
        return res.status(400).json({
            message: "stationId, serviceId and price are required"
        });
    }

    const sql = `
        INSERT INTO station_service_prices
        (stationId, serviceId, price)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        price = VALUES(price),
        isActive = 1
    `;

    db.query(sql, [stationId, serviceId, price], (err) => {
        if (err) {
            console.error("Error saving station service price:", err);

            return res.status(500).json({
                message: "Error saving station service price"
            });
        }

        res.status(200).json({
            message: "Station service price saved successfully"
        });
    });
};

// Get all service prices for a station
const getStationServicePrices = (req, res) => {
    const stationId = req.params.stationId;

    const sql = `
        SELECT
            p.id,
            p.stationId,
            p.serviceId,
            s.name AS serviceName,
            p.price,
            p.isActive
        FROM station_service_prices p
        JOIN services s ON s.id = p.serviceId
        WHERE p.stationId = ?
    `;

    db.query(sql, [stationId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching station service prices"
            });
        }

        res.status(200).json({
            prices: results
        });
    });
};
// Deactivate a station-specific service price
const deactivateStationServicePrice = (req, res) => {
    const priceId = req.params.id;

    const sql = `
        UPDATE station_service_prices
        SET isActive = 0
        WHERE id = ?
    `;

    db.query(sql, [priceId], (err, result) => {
        if (err) {
            console.error("Error deactivating service price:", err);

            return res.status(500).json({
                message: "Error deactivating service price"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Service price not found"
            });
        }

        res.status(200).json({
            message: "Station service price deactivated successfully"
        });
    });
};
module.exports = {
    addOrUpdateStationServicePrice,
    getStationServicePrices,
    deactivateStationServicePrice
};

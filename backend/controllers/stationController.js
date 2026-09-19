const db = require("../config/db");

// Get all active stations
const getAllStations = (req, res) => {
    const sql = "SELECT * FROM stations WHERE isActive = 1";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching stations"
            });
        }

        res.status(200).json({
            stations: results
        });
    });
};

// Get a station by ID
const getStationById = (req, res) => {
    const stationId = req.params.id;

    const sql = "SELECT * FROM stations WHERE id = ?";

    db.query(sql, [stationId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching station"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Station not found"
            });
        }

        res.status(200).json({
            station: results[0]
        });
    });
};

// Create a new station
const createStation = (req, res) => {
    const {
        name,
        address,
        phone,
        email,
        operatingHours
    } = req.body;

    if (!name || !address) {
        return res.status(400).json({
            message: "Name and address are required"
        });
    }

    const sql = `
        INSERT INTO stations
        (name, address, phone, email, operatingHours)
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
        name,
        address,
        phone || null,
        email || null,
        operatingHours || null
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error creating station:", err);

            return res.status(500).json({
                message: "Error creating station"
            });
        }

        res.status(201).json({
            message: "Station created successfully",
            stationId: result.insertId
        });
    });
};

// Update a station
const updateStation = (req, res) => {
    const stationId = req.params.id;

    const {
        name,
        address,
        phone,
        email,
        operatingHours
    } = req.body;

    if (!name || !address) {
        return res.status(400).json({
            message: "Name and address are required"
        });
    }

    const sql = `
        UPDATE stations
        SET name = ?,
            address = ?,
            phone = ?,
            email = ?,
            operatingHours = ?
        WHERE id = ?
    `;

    const values = [
        name,
        address,
        phone || null,
        email || null,
        operatingHours || null,
        stationId
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating station:", err);

            return res.status(500).json({
                message: "Error updating station"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Station not found"
            });
        }

        res.status(200).json({
            message: "Station updated successfully"
        });
    });
};

// Deactivate a station
const deactivateStation = (req, res) => {
    const stationId = req.params.id;

    const sql = `
        UPDATE stations
        SET isActive = 0
        WHERE id = ?
    `;

    db.query(sql, [stationId], (err, result) => {
        if (err) {
            console.error("Error deactivating station:", err);

            return res.status(500).json({
                message: "Error deactivating station"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Station not found"
            });
        }

        res.status(200).json({
            message: "Station deactivated successfully"
        });
    });
};
module.exports = {
    getAllStations,
    getStationById,
    createStation,
    updateStation,
    deactivateStation
};  


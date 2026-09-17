const db = require("../config/db");

const addCar = (req, res) => {
    const { brand, model, registration_number, year } = req.body;

    if (!brand || !model || !registration_number) {
        return res.status(400).json({
            message: "Brand, model and registration number are required"
        });
    }

    const user_id = req.user.id;

    const sql = `
        INSERT INTO cars
        (user_id, brand, model, registration_number, year)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [user_id, brand, model, registration_number, year],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error adding car"
                });
            }

            res.status(201).json({
                message: "Car added successfully",
                carId: result.insertId
            });
        }
    );
};



const getMyCars = (req, res) => {
    const user_id = req.user.id;

    const sql = "SELECT * FROM cars WHERE user_id = ?";

    db.query(sql, [user_id], (err, results) => {
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
const updateCar = (req, res) => {
    const car_id = req.params.id;
    const user_id = req.user.id;

    const { brand, model, registration_number, year } = req.body;

    if (!brand || !model || !registration_number) {
        return res.status(400).json({
            message: "Brand, model and registration number are required"
        });
    }

    const sql = `
        UPDATE cars
        SET brand = ?, model = ?, registration_number = ?, year = ?
        WHERE id = ? AND user_id = ?
    `;

    db.query(
        sql,
        [brand, model, registration_number, year, car_id, user_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error updating car"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Car not found"
                });
            }

            res.status(200).json({
                message: "Car updated successfully"
            });
        }
    );
};
const deleteCar = (req, res) => {
    const car_id = req.params.id;
    const user_id = req.user.id;

    const sql = "DELETE FROM cars WHERE id = ? AND user_id = ?";

    db.query(sql, [car_id, user_id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error deleting car"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Car not found"
            });
        }

        res.status(200).json({
            message: "Car deleted successfully"
        });
    });
};
module.exports = {
    addCar,
    getMyCars,
    updateCar,
    deleteCar

};
const db =require("../config/db");

const getAllServices = (req, res) => {
    const sql = "SELECT * FROM services";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching services"
            });
        }

        res.status(200).json({
            services: results
        });
    });
};
module.exports = {
    getAllServices
};
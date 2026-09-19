const bcrypt = require("bcryptjs");
const db = require("../config/db");

// GET ALL ADMIN ACCOUNTS
const getAllAdmins = (req, res) => {
    const sql = `
        SELECT id, name, email, phone, role, is_active
        FROM users
        WHERE role = 'admin'
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Get admins error:", err);

            return res.status(500).json({
                message: "Error fetching admin accounts"
            });
        }

        return res.status(200).json({
            admins: results
        });
    });
};

// CREATE NEW ADMIN
const createAdmin = async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Name, email and password are required"
        });
    }

    try {
        const checkSql = "SELECT id FROM users WHERE email = ?";

        db.query(checkSql, [email], async (checkError, results) => {
            if (checkError) {
                console.error("Check admin email error:", checkError);

                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    message: "Email is already registered"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const insertSql = `
                INSERT INTO users
                (name, email, password, phone, role, is_active)
                VALUES (?, ?, ?, ?, 'admin', 1)
            `;

            db.query(
                insertSql,
                [name, email, hashedPassword, phone || null],
                (insertError, result) => {
                    if (insertError) {
                        console.error("Create admin error:", insertError);

                        return res.status(500).json({
                            message: "Error creating admin account"
                        });
                    }

                    return res.status(201).json({
                        message: "Admin account created successfully",
                        adminId: result.insertId
                    });
                }
            );
        });
    } catch (error) {
        console.error("Admin creation error:", error);

        return res.status(500).json({
            message: "Error processing admin account"
        });
    }
};

// UPDATE ADMIN DETAILS
const updateAdmin = (req, res) => {
    const adminId = req.params.id;
    const { name, email, phone } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            message: "Name and email are required"
        });
    }

    const checkSql = `
        SELECT id, role
        FROM users
        WHERE id = ?
    `;

    db.query(checkSql, [adminId], (checkError, results) => {
        if (checkError) {
            console.error("Check admin error:", checkError);

            return res.status(500).json({
                message: "Database error"
            });
        }

        if (results.length === 0 || results[0].role !== "admin") {
            return res.status(404).json({
                message: "Admin account not found"
            });
        }

        const updateSql = `
            UPDATE users
            SET name = ?, email = ?, phone = ?
            WHERE id = ? AND role = 'admin'
        `;

        db.query(
            updateSql,
            [name, email, phone || null, adminId],
            (updateError) => {
                if (updateError) {
                    console.error("Update admin error:", updateError);

                    if (updateError.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({
                            message: "Email is already registered"
                        });
                    }

                    return res.status(500).json({
                        message: "Error updating admin account"
                    });
                }

                return res.status(200).json({
                    message: "Admin details updated successfully"
                });
            }
        );
    });
};

// ACTIVATE OR DEACTIVATE ADMIN
const updateAdminStatus = (req, res) => {
    const adminId = req.params.id;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean" && is_active !== 0 && is_active !== 1) {
        return res.status(400).json({
            message: "is_active must be true, false, 1 or 0"
        });
    }

    const sql = `
        UPDATE users
        SET is_active = ?
        WHERE id = ? AND role = 'admin'
    `;

    db.query(sql, [is_active ? 1 : 0, adminId], (err, result) => {
        if (err) {
            console.error("Update admin status error:", err);

            return res.status(500).json({
                message: "Error updating admin status"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Admin account not found"
            });
        }

        return res.status(200).json({
            message: is_active
                ? "Admin account activated successfully"
                : "Admin account deactivated successfully"
        });
    });
};

// DELETE ADMIN ACCOUNT
const deleteAdmin = (req, res) => {
    const adminId = req.params.id;

    const sql = `
        DELETE FROM users
        WHERE id = ? AND role = 'admin'
    `;

    db.query(sql, [adminId], (err, result) => {
        if (err) {
            console.error("Delete admin error:", err);

            return res.status(500).json({
                message: "Unable to delete admin account"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Admin account not found"
            });
        }

        return res.status(200).json({
            message: "Admin account deleted successfully"
        });
    });
};

module.exports = {
    getAllAdmins,
    createAdmin,
    updateAdmin,
    updateAdminStatus,
    deleteAdmin
};
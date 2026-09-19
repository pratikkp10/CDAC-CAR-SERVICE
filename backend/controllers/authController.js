const bcrypt = require("bcryptjs");
const db = require("../config/db");
const jwt = require("jsonwebtoken");

// REGISTER USER
const registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Name, email and password are required"
        });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        if (results.length > 0) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            const insertSql = `
                INSERT INTO users
                (name, email, password, phone, is_active)
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(
                insertSql,
                [name, email, hashedPassword, phone || null, 1],
                (err, result) => {
                    if (err) {
                        console.error("Registration error:", err);

                        return res.status(500).json({
                            message: "Error creating user"
                        });
                    }

                    return res.status(201).json({
                        message: "User registered successfully",
                        userId: result.insertId
                    });
                }
            );
        } catch (error) {
            console.error("Password hashing error:", error);

            return res.status(500).json({
                message: "Error processing registration"
            });
        }
    });
};
// LOGIN USER
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = results[0];

        // Check whether the account is active
        if (Number(user.is_active) === 0) {
            return res.status(403).json({
                message: "Your account has been deactivated. Please contact the administrator."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.jwt_secret,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                is_active: user.is_active
            }
        });
    });
};

// GET LOGGED-IN USER PROFILE
const getProfile = (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT id, name, email, phone, role
        FROM users
        WHERE id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile fetched successfully",
            user: results[0]
        });
    });
};

// UPDATE LOGGED-IN USER PROFILE
const updateProfile = (req, res) => {
    const userId = req.user.id;
    const { name, email, phone } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            message: "Name and email are required"
        });
    }

    const checkEmailSql = `
        SELECT id
        FROM users
        WHERE email = ? AND id != ?
    `;

    db.query(
        checkEmailSql,
        [email, userId],
        (err, existingUsers) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (existingUsers.length > 0) {
                return res.status(400).json({
                    message: "Email is already used by another account"
                });
            }

            const updateSql = `
                UPDATE users
                SET name = ?, email = ?, phone = ?
                WHERE id = ?
            `;

            db.query(
                updateSql,
                [name, email, phone || null, userId],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Unable to update profile"
                        });
                    }

                    const getUpdatedUserSql = `
                        SELECT id, name, email, phone, role
                        FROM users
                        WHERE id = ?
                    `;

                    db.query(
                        getUpdatedUserSql,
                        [userId],
                        (err, results) => {
                            if (err) {
                                return res.status(500).json({
                                    message: "Profile updated, but user data could not be fetched"
                                });
                            }

                            res.status(200).json({
                                message: "Profile updated successfully",
                                user: results[0]
                            });
                        }
                    );
                }
            );
        }
    );
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            message: "Current password and new password are required"
        });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({
            message: "New password must contain at least 8 characters"
        });
    }

    const sql = "SELECT password FROM users WHERE id = ?";

    db.query(sql, [userId], async (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const passwordMatch = await bcrypt.compare(
            currentPassword,
            results[0].password
        );

        if (!passwordMatch) {
            return res.status(400).json({
                message: "Current password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updateSql = `
            UPDATE users
            SET password = ?
            WHERE id = ?
        `;

        db.query(
            updateSql,
            [hashedPassword, userId],
            (err) => {
                if (err) {
                    return res.status(500).json({
                        message: "Unable to change password"
                    });
                }

                res.status(200).json({
                    message: "Password changed successfully"
                });
            }
        );
    });
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    changePassword
};
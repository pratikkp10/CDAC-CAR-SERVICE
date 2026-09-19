const db = require("../config/db");

// Get overall system statistics
const getSystemStats = (req, res) => {
    const queries = {
        totalUsers: "SELECT COUNT(*) AS count FROM users",

        totalBookings: "SELECT COUNT(*) AS count FROM bookings",

        pendingBookings:
            "SELECT COUNT(*) AS count FROM bookings WHERE status = 'pending'",

        completedBookings:
            "SELECT COUNT(*) AS count FROM bookings WHERE status = 'completed'",

        cancelledBookings:
            "SELECT COUNT(*) AS count FROM bookings WHERE status = 'cancelled'",

        totalActiveStations:
            "SELECT COUNT(*) AS count FROM stations WHERE isActive = 1",

        totalRevenue:
            "SELECT COALESCE(SUM(amount), 0) AS revenue FROM receipts WHERE paymentStatus = 'paid'",
    };

    const results = {};
    const queryNames = Object.keys(queries);
    let completedQueries = 0;

    queryNames.forEach((queryName) => {
        db.query(queries[queryName], (err, data) => {
            if (err) {
                console.error(
                    `Error fetching ${queryName}:`,
                    err
                );

                return res.status(500).json({
                    message: `Error fetching ${queryName}`,
                });
            }

            if (queryName === "totalRevenue") {
                results[queryName] = data[0].revenue;
            } else {
                results[queryName] = data[0].count;
            }

            completedQueries++;

            if (completedQueries === queryNames.length) {
                return res.status(200).json({
                    message: "System statistics fetched successfully",

                    statistics: results,
                });
            }
        });
    });
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
                message: "Error fetching users",
            });
        }

        return res.status(200).json({
            message: "Users fetched successfully",
            users: results,
        });
    });
};

// Update user role
const updateUserRole = (req, res) => {
    const userId = Number(req.params.id);
    const requestedRole = String(
        req.body?.role || ""
    )
        .trim()
        .toLowerCase();

    const allowedRoles = [
        "customer",
        "admin",
        "superadmin",
    ];

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
            message: "Invalid user ID",
        });
    }

    if (!allowedRoles.includes(requestedRole)) {
        return res.status(400).json({
            message: "Invalid role",
            receivedRole: requestedRole,
            allowedRoles,
        });
    }

    // Prevent changing your own role
    if (userId === Number(req.user.id)) {
        return res.status(400).json({
            message: "You cannot change your own role",
        });
    }

    // First check the target user
    const findUserSql = `
        SELECT id, role
        FROM users
        WHERE id = ?
    `;

    db.query(findUserSql, [userId], (findErr, users) => {
        if (findErr) {
            console.error(
                "Error finding target user:",
                findErr
            );

            return res.status(500).json({
                message: "Error finding target user",
            });
        }

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const targetUser = users[0];

        // Protect existing Super Admin accounts
        if (targetUser.role === "superadmin") {
            return res.status(403).json({
                message:
                    "You cannot change another Super Admin's role",
            });
        }

        const updateUserSql = `
            UPDATE users
            SET role = ?
            WHERE id = ?
        `;

        db.query(
            updateUserSql,
            [requestedRole, userId],
            (updateErr, result) => {
                if (updateErr) {
                    console.error(
                        "Error updating user role:",
                        updateErr
                    );

                    return res.status(500).json({
                        message: "Error updating user role",
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message: "User not found",
                    });
                }

                return res.status(200).json({
                    message: "User role updated successfully",
                    userId,
                    newRole: requestedRole,
                });
            }
        );
    });
};

// Get all bookings
const getAllBookings = (req, res) => {
    const sql = `
        SELECT
            b.id AS bookingId,
            b.booking_date,
            b.status,

            u.id AS customerId,
            u.name AS customerName,
            u.email AS customerEmail,

            c.brand AS carBrand,
            c.model AS carModel,
            c.registration_number AS registrationNumber,

            s.name AS serviceName,

            st.id AS stationId,
            st.name AS stationName,
            st.address AS stationAddress,

            COALESCE(ssp.price, s.price) AS servicePrice

        FROM bookings b

        JOIN users u
            ON b.user_id = u.id

        JOIN cars c
            ON b.car_id = c.id

        JOIN services s
            ON b.service_id = s.id

        LEFT JOIN stations st
            ON b.stationId = st.id

        LEFT JOIN station_service_prices ssp
            ON b.stationId = ssp.stationId
            AND b.service_id = ssp.serviceId
            AND ssp.isActive = 1

        ORDER BY b.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching bookings:", err);

            return res.status(500).json({
                message: "Error fetching bookings",
            });
        }

        return res.status(200).json({
            message: "All bookings fetched successfully",
            bookings: results,
        });
    });
};

module.exports = {
    getSystemStats,
    getAllUsers,
    updateUserRole,
    getAllBookings,
};
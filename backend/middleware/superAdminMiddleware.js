const superAdminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    if (req.user.role !== "superadmin") {
        return res.status(403).json({
            message: "Super Admin access required"
        });
    }

    next();
};

module.exports = superAdminMiddleware;
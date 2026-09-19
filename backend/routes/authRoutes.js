const express = require("express");

const {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/test", authMiddleware, (req, res) => {
    res.json({
        message: "You are authenticated!",
        user: req.user
    });
});

// Profile routes
router.get("/profile", authMiddleware, getProfile);

router.put("/profile", authMiddleware, updateProfile);

router.put(
    "/profile/password",
    authMiddleware,
    changePassword
);

module.exports = router;
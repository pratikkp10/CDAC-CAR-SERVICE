const express = require("express");

const { addCar, getMyCars, updateCar,deleteCar } = require("../controllers/carController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, addCar);
router.get("/", authMiddleware, getMyCars);
router.put("/:id", authMiddleware, updateCar);
router.delete("/:id", authMiddleware, deleteCar);

module.exports = router;
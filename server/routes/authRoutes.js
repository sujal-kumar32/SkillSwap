const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { auth } = require("../validations");
const protect = require("../middleware/authMiddleware");

const { register, login, changePassword } = require("../apis/Auth/authController");

router.post("/register", validate(auth.register), register);
router.post("/login", validate(auth.login), login);
router.post("/change-password", protect, validate(auth.changePassword), changePassword);

module.exports = router;

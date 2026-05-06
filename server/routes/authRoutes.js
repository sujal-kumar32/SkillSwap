const express = require("express");
const router = express.Router();

const { register, login } = require("../apis/Auth/authController");

router.post("/register", register);
router.post("/login", login);

module.exports = router;

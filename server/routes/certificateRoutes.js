const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { downloadCertificate } = require("../apis/Certificate/certificateController");

router.get("/download/:skillName", protect, downloadCertificate);

module.exports = router;

const express = require("express");
const router = express.Router();
const { getPublicStats } = require("../apis/Stats/statsController");

router.get("/public", getPublicStats);

module.exports = router;

const express = require("express");
const router = express.Router();
const { submitContact } = require("../apis/Contact/contactController");

router.post("/", submitContact);

module.exports = router;

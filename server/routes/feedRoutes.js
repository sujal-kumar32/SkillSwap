const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const ctrl = require("../apis/Feed/feedController");

router.get("/", protect, ctrl.getFeed);

module.exports = router;

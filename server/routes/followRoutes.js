const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const ctrl = require("../apis/Follow/followController");

router.post("/toggle", protect, ctrl.toggleFollow);
router.get("/followers/:userId", ctrl.getFollowers);
router.get("/following/:userId", ctrl.getFollowing);
router.get("/count/:userId", ctrl.getFollowCount);
router.get("/status/:userId", protect, ctrl.getFollowStatus);

module.exports = router;

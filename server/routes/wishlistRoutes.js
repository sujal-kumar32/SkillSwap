const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { toggleWishlist, getWishlist, checkWishlist } = require("../apis/Wishlist/wishlistController");

router.post("/toggle", protect, toggleWishlist);
router.get("/", protect, getWishlist);
router.get("/check/:sessionId", protect, checkWishlist);

module.exports = router;

const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { toggleWishlist, getWishlist } = require("../apis/Wishlist/wishlistController");

router.post("/toggle", protect, toggleWishlist);
router.get("/", protect, getWishlist);

module.exports = router;

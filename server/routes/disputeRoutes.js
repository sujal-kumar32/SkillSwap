const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const ctrl = require("../apis/Dispute/disputeController");

router.post("/", protect, ctrl.createDispute);
router.get("/", protect, ctrl.getMyDisputes);
router.get("/all", protect, requireAdmin, ctrl.getAllDisputes);
router.get("/:id", protect, ctrl.getDispute);
router.put("/:id/resolve", protect, requireAdmin, ctrl.resolveDispute);

module.exports = router;

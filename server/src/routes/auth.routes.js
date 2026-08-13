const express = require("express");
const { requestOtp, verifyOtp, me } = require("../controllers/auth.controller");
const { validateRequestOtp, validateVerifyOtp } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/request-otp", validateRequestOtp, requestOtp);
router.post("/verify-otp", validateVerifyOtp, verifyOtp);
router.get("/me", requireAuth, me);

module.exports = router;

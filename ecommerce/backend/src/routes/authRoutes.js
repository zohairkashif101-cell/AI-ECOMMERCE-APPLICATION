const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  signup,
  login,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many password reset attempts. Please try again later." },
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", passwordResetLimiter, requestPasswordReset);
router.post("/reset-password", passwordResetLimiter, resetPassword);

module.exports = router;



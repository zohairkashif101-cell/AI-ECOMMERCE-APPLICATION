const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const MIN_PASSWORD_LENGTH = 6;
const OTP_LIFETIME_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const hashOtp = (otp) => crypto
  .createHmac("sha256", process.env.JWT_SECRET)
  .update(otp)
  .digest("hex");

const passwordsAreValid = (password, confirmPassword) =>
  typeof password === "string" &&
  password.length >= MIN_PASSWORD_LENGTH &&
  password === confirmPassword;

const signup = async (req, res) => {
  try {
    const { name, email, password, role = "customer", ownerSignupKey } = req.body;

    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Name and email are required" });
    }
    if (!passwordsAreValid(password, password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!["customer", "owner"].includes(role)) {
      return res.status(400).json({ message: "Role must be customer or owner" });
    }
    if (role === "owner") {
      const configuredOwnerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
      const expectedKey = process.env.OWNER_SIGNUP_KEY;
      if (
        !configuredOwnerEmail ||
        normalizedEmail !== configuredOwnerEmail ||
        !expectedKey ||
        typeof ownerSignupKey !== "string"
      ) {
        return res.status(403).json({ message: "Owner signup is not configured or the invite key is invalid" });
      }
      const supplied = Buffer.from(ownerSignupKey);
      const expected = Buffer.from(expectedKey);
      if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
        return res.status(403).json({ message: "Owner signup is not configured or the invite key is invalid" });
      }
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Signup failed",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (req.body.role && req.body.role !== user.role) {
      return res.status(403).json({
        message: `This account is registered as a ${user.role}`,
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

const getMailTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid TCP port");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

const requestPasswordReset = async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(503).json({ message: "Password reset is not configured" });
    }

    const transporter = getMailTransporter();
    if (!transporter) {
      return res.status(503).json({ message: "Password reset email is not configured. Please contact the store owner." });
    }

    const user = await User.findOne({ email });
    if (user) {
      const otp = crypto.randomInt(100000, 1000000).toString();
      user.passwordResetOtpHash = hashOtp(otp);
      user.passwordResetOtpExpiresAt = new Date(Date.now() + OTP_LIFETIME_MS);
      user.passwordResetOtpAttempts = 0;
      await user.save();

      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: user.email,
          subject: "Your password reset code",
          text: `Your password reset code is ${otp}. It expires in 10 minutes and can only be used once.`,
        });
      } catch (error) {
        user.passwordResetOtpHash = undefined;
        user.passwordResetOtpExpiresAt = undefined;
        user.passwordResetOtpAttempts = 0;
        await user.save();
        console.error("Failed to send password reset email:", error.message);
        return res.status(503).json({ message: "Could not send the reset code. Please try again later." });
      }
    }

    return res.status(200).json({
      message: "If an account exists for that email, a reset code has been sent.",
    });
  } catch (error) {
    console.error("Password reset request failed:", error.message);
    return res.status(500).json({ message: "Failed to request a password reset" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;
    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp) ||
      !passwordsAreValid(password, confirmPassword)
    ) {
      return res.status(400).json({
        message: "Enter a valid email, six-digit code, and matching password of at least 6 characters",
      });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(503).json({ message: "Password reset is not configured" });
    }

    const now = new Date();
    const user = await User.findOneAndUpdate(
      {
        email: email.trim().toLowerCase(),
        passwordResetOtpHash: { $exists: true },
        passwordResetOtpExpiresAt: { $gt: now },
        passwordResetOtpAttempts: { $lt: MAX_OTP_ATTEMPTS },
      },
      { $inc: { passwordResetOtpAttempts: 1 } },
      { new: true }
    ).select("+passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpAttempts");
    if (!user) {
      return res.status(400).json({ message: "Reset code is invalid or expired. Request a new code." });
    }

    const suppliedHash = Buffer.from(hashOtp(otp), "hex");
    const storedHash = Buffer.from(user.passwordResetOtpHash, "hex");
    if (
      suppliedHash.length !== storedHash.length ||
      !crypto.timingSafeEqual(suppliedHash, storedHash)
    ) {
      if (user.passwordResetOtpAttempts >= MAX_OTP_ATTEMPTS) {
        await User.updateOne(
          { _id: user._id, passwordResetOtpHash: user.passwordResetOtpHash },
          { $unset: { passwordResetOtpHash: 1, passwordResetOtpExpiresAt: 1 } }
        );
      }
      return res.status(400).json({ message: "Reset code is invalid or expired. Request a new code." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const updateResult = await User.updateOne(
      {
        _id: user._id,
        passwordResetOtpHash: user.passwordResetOtpHash,
        passwordResetOtpExpiresAt: { $gt: new Date() },
      },
      {
        $set: { password: passwordHash, passwordResetOtpAttempts: 0 },
        $unset: { passwordResetOtpHash: 1, passwordResetOtpExpiresAt: 1 },
      },
      { runValidators: true }
    );
    if (updateResult.modifiedCount !== 1) {
      return res.status(400).json({ message: "Reset code is invalid or expired. Request a new code." });
    }

    return res.status(200).json({ message: "Password updated successfully. You can now log in." });
  } catch (error) {
    console.error("Password reset failed:", error.message);
    return res.status(500).json({ message: "Failed to reset password" });
  }
};

module.exports = {
  signup,
  login,
  requestPasswordReset,
  resetPassword,
};
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let decoded;
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    const token = authHeader.split(" ")[1];

    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  try {
    const user = await User.findById(decoded.userId).select("name role");
    if (!user) {
      return res.status(401).json({ message: "Account no longer exists" });
    }

    req.user = { id: user._id.toString(), name: user.name, role: user.role };
    next();
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify account permissions" });
  }
};

module.exports = protect;
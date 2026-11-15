const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const jsonwebtoken = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
require("dotenv").config();


const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const policyRoutes = require("./routes/policyroutes");
const cartRoutes = require("./routes/cartRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
app.use(helmet());
app.use(morgan("dev"));

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/policy", policyRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/chat", chatRoutes);



// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Ecommerce API is running",
  });
});

module.exports = app;
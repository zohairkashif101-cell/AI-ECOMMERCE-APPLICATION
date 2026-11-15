const express = require("express");
const {
    getcart,
    addToCart,
    removeFromCart,
} = require("../controllers/cartcontroller");

const authMiddleware = require("../middleware/authMiddleware"); 
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

router.get("/", authMiddleware, authorizeRoles("customer"), getcart);
router.post("/add", authMiddleware, authorizeRoles("customer"), addToCart);
router.post("/remove", authMiddleware, authorizeRoles("customer"), removeFromCart);

module.exports = router;
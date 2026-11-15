const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);

router.post("/", authMiddleware, authorizeRoles("owner"), createProduct);
router.put("/:id", authMiddleware, authorizeRoles("owner"), updateProduct);
router.delete("/:id", authMiddleware, authorizeRoles("owner"), deleteProduct);

module.exports = router;
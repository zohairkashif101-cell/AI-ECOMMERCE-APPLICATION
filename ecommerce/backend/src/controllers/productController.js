const Product = require("../models/Product");

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json({
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get products",
      error: error.message,
    });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get product",
      error: error.message,
    });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    if (!name || !description || price === undefined || !image || !category) {
      return res.status(400).json({
        message: "Name, description, price, image and category are required",
      });
    }

    const availableStock = stock === undefined ? 10 : Number(stock);
    if (!Number.isInteger(availableStock) || availableStock < 0) {
      return res.status(400).json({ message: "Stock must be a non-negative whole number" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image,
      category,
      stock: availableStock,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const allowedFields = ["name", "description", "price", "image", "category", "stock"];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([field]) => allowedFields.includes(field))
    );

    if (updates.stock !== undefined) {
      updates.stock = Number(updates.stock);
      if (!Number.isInteger(updates.stock) || updates.stock < 0) {
        return res.status(400).json({ message: "Stock must be a non-negative whole number" });
      }
    }
    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
      if (!Number.isFinite(updates.price) || updates.price < 0) {
        return res.status(400).json({ message: "Price must be a non-negative number" });
      }
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "At least one valid product field is required" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
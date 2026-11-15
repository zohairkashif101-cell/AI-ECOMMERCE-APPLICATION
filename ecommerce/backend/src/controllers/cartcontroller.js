const cart = require('../models/cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const getcart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartData = await cart.findOne({ userId }).populate('items.productId');
        if (!cartData) {
            return res.status(404).json({ message: 'cart not found' });
        }

        res.status(200).json({ cart: cartData });
    } catch (error) {
        res.status(500).json({ message: 'failed to get cart', error: error.message });
    }
}

const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;
        const quantity = req.body.quantity === undefined ? 1 : Number(req.body.quantity);

        if (!mongoose.isValidObjectId(productId) || !Number.isInteger(quantity) || quantity === 0) {
            return res.status(400).json({ message: 'A valid productId and non-zero integer quantity are required' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const existingCart = await cart.findOne({ userId, "items.productId": product._id });
        const existingItem = existingCart?.items.find(
            (item) => item.productId.toString() === product._id.toString()
        );
        const resultingQuantity = (existingItem?.quantity || 0) + quantity;

        if (resultingQuantity < 1) {
            return res.status(400).json({ message: 'Cart item quantity must be at least 1' });
        }
        if (resultingQuantity > product.stock) {
            return res.status(400).json({ message: `Only ${product.stock} item(s) are in stock` });
        }

        let response;
        if (existingItem) {
            response = await cart.findOneAndUpdate(
                { userId, "items.productId": product._id },
                { $inc: { "items.$.quantity": Number(quantity) } },
                { new: true }
            ).populate('items.productId');
        } else {
            response = await cart.findOneAndUpdate(
                { userId },
                { $push: { items: { productId: product._id, quantity } } },
                { new: true, upsert: true }
            ).populate('items.productId');
        }

        res.status(200).json({ cart: response });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add to cart', error: error.message });
    }
};
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        let { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'productId is required' });
        }

        // Agar productId object ban kar aa gaya hai toh usme se _id nikal lo
        if (typeof productId === 'object' && productId !== null) {
            productId = productId._id || productId.toString();
        }

        // Hum items ke andar se match karne ke liye dono formats (string ya ObjectId) check kar lete hain
        const response = await cart.findOneAndUpdate(
            { userId },
            { $pull: { items: { productId: String(productId) } } },
            { new: true }
        ).populate('items.productId');

        res.status(200).json({ cart: response });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove from cart', error: error.message });
    }
};

module.exports = { getcart, addToCart, removeFromCart };

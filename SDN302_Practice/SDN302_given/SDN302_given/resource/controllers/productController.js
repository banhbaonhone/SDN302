const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');

// GET /api/products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to retrieve products',
      error: error.message
    });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Product not found: Invalid ID format' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to retrieve product',
      error: error.message
    });
  }
};

// POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const { name, price, category, stock } = req.body;

    // Field validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (price === undefined || price === null || typeof price !== 'number' || price < 0) {
      return res.status(400).json({ message: 'Product price is required and must be >= 0' });
    }
    if (!category || typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({ message: 'Product category is required' });
    }
    if (stock === undefined || stock === null || typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ message: 'Product stock is required and must be >= 0' });
    }

    const product = new Product({
      name: name.trim(),
      price,
      category: category.trim(),
      stock
    });

    const savedProduct = await product.save();
    return res.status(201).json(savedProduct);
  } catch (error) {
    return res.status(400).json({
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Product not found: Invalid ID format' });
    }

    const { name, price, category, stock } = req.body;

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({ message: 'Price must be a number >= 0' });
    }
    if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
      return res.status(400).json({ message: 'Stock must be a number >= 0' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = typeof name === 'string' ? name.trim() : name;
    if (price !== undefined) updateData.price = price;
    if (category !== undefined) updateData.category = typeof category === 'string' ? category.trim() : category;
    if (stock !== undefined) updateData.stock = stock;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(400).json({
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Product not found: Invalid ID format' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if any Order references this product
    const orderWithProduct = await Order.findOne({ 'items.product_id': id });
    if (orderWithProduct) {
      return res.status(409).json({
        message: 'Cannot delete product: Product is referenced in one or more orders.'
      });
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      message: 'Product deleted successfully',
      product
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

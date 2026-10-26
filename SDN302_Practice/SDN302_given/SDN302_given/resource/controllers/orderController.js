const mongoose = require('mongoose');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

// GET /api/orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer_id', 'name email phone address')
      .populate('items.product_id', 'name price category stock')
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to retrieve orders',
      error: error.message
    });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Order not found: Invalid ID format' });
    }

    const order = await Order.findById(id)
      .populate('customer_id', 'name email phone address')
      .populate('items.product_id', 'name price category stock');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to retrieve order',
      error: error.message
    });
  }
};

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { customer_id, items, payment_method, status, order_date } = req.body;

    // Validate customer_id
    if (!customer_id || !mongoose.Types.ObjectId.isValid(customer_id)) {
      return res.status(400).json({ message: 'A valid customer_id is required' });
    }

    const customer = await Customer.findById(customer_id);
    if (!customer) {
      return res.status(400).json({ message: 'Referenced Customer does not exist' });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one product item' });
    }

    // Validate required fields
    if (!payment_method || typeof payment_method !== 'string' || payment_method.trim() === '') {
      return res.status(400).json({ message: 'payment_method is required' });
    }

    if (!status || typeof status !== 'string' || status.trim() === '') {
      return res.status(400).json({ message: 'status is required' });
    }

    const parsedOrderDate = order_date ? new Date(order_date) : new Date();
    if (isNaN(parsedOrderDate.getTime())) {
      return res.status(400).json({ message: 'Invalid order_date format' });
    }

    // Process each item, validate product, check stock, calculate totals on server
    const processedItems = [];
    let calculatedTotalAmount = 0;
    const productsToUpdate = [];

    for (const item of items) {
      if (!item.product_id || !mongoose.Types.ObjectId.isValid(item.product_id)) {
        return res.status(400).json({ message: 'Invalid or missing product_id in items' });
      }

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'Item quantity must be an integer >= 1' });
      }

      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(400).json({ message: `Product not found with ID: ${item.product_id}` });
      }

      if (quantity > product.stock) {
        return res.status(400).json({
          message: `Insufficient stock for product '${product.name}'. Available: ${product.stock}, Requested: ${quantity}`
        });
      }

      const priceAtOrder = product.price;
      const itemTotal = priceAtOrder * quantity;
      calculatedTotalAmount += itemTotal;

      processedItems.push({
        product_id: product._id,
        quantity,
        price_at_order: priceAtOrder,
        total: itemTotal
      });

      productsToUpdate.push({ product, quantity });
    }

    // Deduct stock for all items
    for (const { product, quantity } of productsToUpdate) {
      product.stock -= quantity;
      await product.save();
    }

    // Create order document
    const newOrder = new Order({
      customer_id: customer._id,
      items: processedItems,
      total_amount: calculatedTotalAmount,
      payment_method: payment_method.trim(),
      status: status.trim(),
      order_date: parsedOrderDate
    });

    const savedOrder = await newOrder.save();
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('customer_id', 'name email phone address')
      .populate('items.product_id', 'name price category stock');

    return res.status(201).json(populatedOrder);
  } catch (error) {
    return res.status(400).json({
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// PUT /api/orders/:id
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Order not found: Invalid ID format' });
    }

    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { customer_id, items, payment_method, status, order_date } = req.body;

    if (customer_id) {
      if (!mongoose.Types.ObjectId.isValid(customer_id)) {
        return res.status(400).json({ message: 'Invalid customer_id format' });
      }
      const customer = await Customer.findById(customer_id);
      if (!customer) {
        return res.status(400).json({ message: 'Customer does not exist' });
      }
      existingOrder.customer_id = customer._id;
    }

    if (items) {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Items must be a non-empty array' });
      }

      const processedItems = [];
      let calculatedTotalAmount = 0;

      for (const item of items) {
        if (!item.product_id || !mongoose.Types.ObjectId.isValid(item.product_id)) {
          return res.status(400).json({ message: 'Invalid product_id in items' });
        }

        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity < 1) {
          return res.status(400).json({ message: 'Quantity must be an integer >= 1' });
        }

        const product = await Product.findById(item.product_id);
        if (!product) {
          return res.status(400).json({ message: `Product not found with ID: ${item.product_id}` });
        }

        if (quantity > product.stock) {
          return res.status(400).json({
            message: `Insufficient stock for product '${product.name}'. Available: ${product.stock}, Requested: ${quantity}`
          });
        }

        const priceAtOrder = product.price;
        const itemTotal = priceAtOrder * quantity;
        calculatedTotalAmount += itemTotal;

        processedItems.push({
          product_id: product._id,
          quantity,
          price_at_order: priceAtOrder,
          total: itemTotal
        });
      }

      existingOrder.items = processedItems;
      existingOrder.total_amount = calculatedTotalAmount;
    }

    if (payment_method !== undefined) {
      existingOrder.payment_method = payment_method;
    }

    if (status !== undefined) {
      existingOrder.status = status;
    }

    if (order_date !== undefined) {
      const parsedDate = new Date(order_date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid order_date format' });
      }
      existingOrder.order_date = parsedDate;
    }

    const updatedOrder = await existingOrder.save();
    const populated = await Order.findById(updatedOrder._id)
      .populate('customer_id', 'name email phone address')
      .populate('items.product_id', 'name price category stock');

    return res.status(200).json(populated);
  } catch (error) {
    return res.status(400).json({
      message: 'Failed to update order',
      error: error.message
    });
  }
};

// DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Order not found: Invalid ID format' });
    }

    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({
      message: 'Order deleted successfully',
      order: deletedOrder
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete order',
      error: error.message
    });
  }
};

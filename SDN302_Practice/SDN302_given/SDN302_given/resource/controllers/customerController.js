const mongoose = require('mongoose');
const Customer = require('../models/Customer');

// GET /api/customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    return res.status(200).json(customers);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to retrieve customers',
      error: error.message
    });
  }
};

// GET /api/customers/:id
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Customer not found: Invalid ID format' });
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    return res.status(200).json(customer);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to retrieve customer',
      error: error.message
    });
  }
};

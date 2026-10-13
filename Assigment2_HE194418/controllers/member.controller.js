const mongoose = require("mongoose");
const db = require("../models");

// Helper: validate ObjectId
const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id) &&
  String(new mongoose.Types.ObjectId(id)) === id;

const MEMBERSHIP_TYPES = ["Student", "Teacher", "Guest"];

// GET /api/members/
const getAllMembers = async (req, res) => {
  try {
    const members = await db.Member.find().select("-__v");

    const formatResponse = members.map((m) => ({
      _id: m._id,
      fullName: m.fullName,
      email: m.email,
      phone: m.phone,
      membershipType: m.membershipType,
      isActive: m.isActive,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));

    res.status(200).json(formatResponse);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// GET /api/members/:id
const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).send({ message: `Invalid id: ${id}` });
    }

    const member = await db.Member.findById(id).select("-__v");
    if (!member) {
      return res.status(404).send({ message: `Member with id = ${id} not found` });
    }

    const formatResponse = {
      _id: member._id,
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      membershipType: member.membershipType,
      isActive: member.isActive,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };

    res.status(200).json(formatResponse);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// POST /api/members/
const createMember = async (req, res) => {
  try {
    const { fullName, email, phone, membershipType, isActive } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      return res.status(400).send({ message: "All fields are required" });
    }

    // Validate membershipType enum
    if (membershipType && !MEMBERSHIP_TYPES.includes(membershipType)) {
      return res.status(400).send({
        message: `Invalid membershipType: ${membershipType}. Must be one of ${MEMBERSHIP_TYPES.join(", ")}`,
      });
    }

    // Ensure email unique
    const existing = await db.Member.findOne({ email });
    if (existing) {
      return res.status(409).send({ message: "Member with this email already exists" });
    }

    const newMember = new db.Member({
      fullName,
      email,
      phone,
      membershipType,
      isActive: isActive !== undefined ? isActive : true,
    });
    await newMember.save();

    const formatResponse = {
      _id: newMember._id,
      fullName: newMember.fullName,
      email: newMember.email,
      phone: newMember.phone,
      membershipType: newMember.membershipType,
      isActive: newMember.isActive,
      createdAt: newMember.createdAt,
      updatedAt: newMember.updatedAt,
    };

    res.status(201).json(formatResponse);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// PUT /api/members/:id
const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).send({ message: `Invalid id: ${id}` });
    }

    const member = await db.Member.findById(id);
    if (!member) {
      return res.status(404).send({ message: `Member with id = ${id} not found` });
    }

    const { fullName, email, phone, membershipType, isActive } = req.body;

    // Validate membershipType enum
    if (membershipType && !MEMBERSHIP_TYPES.includes(membershipType)) {
      return res.status(400).send({
        message: `Invalid membershipType: ${membershipType}. Must be one of ${MEMBERSHIP_TYPES.join(", ")}`,
      });
    }

    // Ensure email unique if changing
    if (email && email !== member.email) {
      const existing = await db.Member.findOne({ email });
      if (existing) {
        return res.status(409).send({ message: "Member with this email already exists" });
      }
    }

    const updated = await db.Member.findByIdAndUpdate(
      id,
      { fullName, email, phone, membershipType, isActive },
      { new: true, runValidators: true }
    ).select("-__v");

    const formatResponse = {
      _id: updated._id,
      fullName: updated.fullName,
      email: updated.email,
      phone: updated.phone,
      membershipType: updated.membershipType,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

    res.status(200).json(formatResponse);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// DELETE /api/members/:id
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).send({ message: `Invalid id: ${id}` });
    }

    const member = await db.Member.findById(id);
    if (!member) {
      return res.status(404).send({ message: `Member with id = ${id} not found` });
    }

    await db.Member.findByIdAndDelete(id);

    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { getAllMembers, getMemberById, createMember, updateMember, deleteMember };

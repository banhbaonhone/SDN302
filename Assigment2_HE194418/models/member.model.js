const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema
const memberSchema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    membershipType: {
      type: String,
      enum: ["Student", "Teacher", "Guest"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Member = mongoose.model("Member", memberSchema, "members");

module.exports = Member;

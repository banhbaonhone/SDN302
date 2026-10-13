const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema
const loanSchema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    member_id: {
      type: String,
      ref: "Member",
      required: true,
    },
    items: [
      {
        book_id: {
          type: String,
          ref: "Book",
          required: true,
        },
        quantity: { type: Number, min: 1, required: true },
        _id: false,
      },
    ],
    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["Borrowing", "Returned", "Overdue"],
      default: "Borrowing",
    },
  },
  { timestamps: true }
);

const Loan = mongoose.model("Loan", loanSchema, "loans");

module.exports = Loan;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema
const bookSchema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    publishedYear: { type: Number },
    totalCopies: { type: Number, min: 0 },
    availableCopies: { type: Number, min: 0 },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema, "books");

module.exports = Book;

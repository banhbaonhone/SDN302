const mongoose = require("mongoose");
const db = require("../models");

// Helper: validate ObjectId
const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id) &&
  String(new mongoose.Types.ObjectId(id)) === id;

// GET /api/books/
const getAllBooks = async (req, res) => {
  try {
    const books = await db.Book.find().select("-__v");

    const formatResponse = books.map((b) => ({
      _id: b._id,
      title: b.title,
      author: b.author,
      category: b.category,
      isbn: b.isbn,
      publishedYear: b.publishedYear,
      totalCopies: b.totalCopies,
      availableCopies: b.availableCopies,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));

    res.status(200).json(formatResponse);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// GET /api/books/:id
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).send({ message: `Invalid id: ${id}` });
    }

    const book = await db.Book.findById(id).select("-__v");
    if (!book) {
      return res.status(404).send({ message: `Book with id = ${id} not found` });
    }

    const formatResponse = {
      _id: book._id,
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      publishedYear: book.publishedYear,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };

    res.status(200).json(formatResponse);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// POST /api/books/
const createBook = async (req, res) => {
  try {
    const { title, author, category, isbn, publishedYear, totalCopies, availableCopies } = req.body;

    // Validate required fields
    if (!title || !author || !category || !isbn) {
      return res.status(400).send({ message: "All fields are required" });
    }

    // Validate copies not negative
    if (totalCopies !== undefined && totalCopies < 0) {
      return res.status(400).send({ message: "totalCopies must not be negative" });
    }
    if (availableCopies !== undefined && availableCopies < 0) {
      return res.status(400).send({ message: "availableCopies must not be negative" });
    }

    // Ensure isbn unique
    const existing = await db.Book.findOne({ isbn });
    if (existing) {
      return res.status(409).send({ message: "Book with this isbn already exists" });
    }

    const newBook = new db.Book({ title, author, category, isbn, publishedYear, totalCopies, availableCopies });
    await newBook.save();

    const formatResponse = {
      _id: newBook._id,
      title: newBook.title,
      author: newBook.author,
      category: newBook.category,
      isbn: newBook.isbn,
      publishedYear: newBook.publishedYear,
      totalCopies: newBook.totalCopies,
      availableCopies: newBook.availableCopies,
      createdAt: newBook.createdAt,
      updatedAt: newBook.updatedAt,
    };

    res.status(201).json(formatResponse);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).send({ message: `Invalid id: ${id}` });
    }

    const book = await db.Book.findById(id);
    if (!book) {
      return res.status(404).send({ message: `Book with id = ${id} not found` });
    }

    const { title, author, category, isbn, publishedYear, totalCopies, availableCopies } = req.body;

    // Validate copies not negative
    if (totalCopies !== undefined && totalCopies < 0) {
      return res.status(400).send({ message: "totalCopies must not be negative" });
    }
    if (availableCopies !== undefined && availableCopies < 0) {
      return res.status(400).send({ message: "availableCopies must not be negative" });
    }

    // Ensure isbn unique if changing
    if (isbn && isbn !== book.isbn) {
      const existing = await db.Book.findOne({ isbn });
      if (existing) {
        return res.status(409).send({ message: "Book with this isbn already exists" });
      }
    }

    const updated = await db.Book.findByIdAndUpdate(
      id,
      { title, author, category, isbn, publishedYear, totalCopies, availableCopies },
      { new: true, runValidators: true }
    ).select("-__v");

    const formatResponse = {
      _id: updated._id,
      title: updated.title,
      author: updated.author,
      category: updated.category,
      isbn: updated.isbn,
      publishedYear: updated.publishedYear,
      totalCopies: updated.totalCopies,
      availableCopies: updated.availableCopies,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

    res.status(200).json(formatResponse);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).send({ message: `Invalid id: ${id}` });
    }

    const book = await db.Book.findById(id);
    if (!book) {
      return res.status(404).send({ message: `Book with id = ${id} not found` });
    }

    await db.Book.findByIdAndDelete(id);

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook };

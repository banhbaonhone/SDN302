const express = require("express");
const { getAllBooks, getBookById, createBook, updateBook, deleteBook } = require("../controllers/book.controller");

const BookRouter = express.Router();

// Q1: Books CRUD
BookRouter.get("/", getAllBooks);
BookRouter.get("/:id", getBookById);
BookRouter.post("/", createBook);
BookRouter.put("/:id", updateBook);
BookRouter.delete("/:id", deleteBook);

module.exports = BookRouter;

const mongoose = require("mongoose");
const Book = require("./book.model");
const Member = require("./member.model");
const Loan = require("./loan.model");

const db = {};

// Define models
db.Book = Book;
db.Member = Member;
db.Loan = Loan;

module.exports = db;
const mongoose = require("mongoose");
const db = require("../models");

// Helper: validate ObjectId
const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id) &&
  String(new mongoose.Types.ObjectId(id)) === id;

// Helper: format a populated loan document
const formatLoan = (loan) => ({
  _id: loan._id,
  member: loan.member_id
    ? {
        _id: loan.member_id._id,
        fullName: loan.member_id.fullName,
        email: loan.member_id.email,
        phone: loan.member_id.phone,
        membershipType: loan.member_id.membershipType,
        isActive: loan.member_id.isActive,
      }
    : null,
  items: (loan.items || []).map((item) => ({
    book: item.book_id
      ? {
          _id: item.book_id._id,
          title: item.book_id.title,
          author: item.book_id.author,
          category: item.book_id.category,
          isbn: item.book_id.isbn,
        }
      : null,
    quantity: item.quantity,
  })),
  borrowDate: loan.borrowDate,
  dueDate: loan.dueDate,
  returnDate: loan.returnDate,
  status: loan.status,
  createdAt: loan.createdAt,
  updatedAt: loan.updatedAt,
});

// GET /api/loans/
const getAllLoans = async (req, res) => {
  try {
    const loans = await db.Loan.find()
      .populate({ path: "member_id", select: "fullName email phone membershipType isActive" })
      .populate({ path: "items.book_id", select: "title author category isbn" })
      .select("-__v");

    const formatResponse = loans.map(formatLoan);
    res.status(200).json(formatResponse);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// GET /api/loans/member/:memberId
const getLoansByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    if (!isValidId(memberId)) {
      return res.status(400).send({ message: `Invalid memberId: ${memberId}` });
    }

    const member = await db.Member.findById(memberId);
    if (!member) {
      return res.status(404).send({ message: `Member with id = ${memberId} not found` });
    }

    const loans = await db.Loan.find({ member_id: memberId })
      .populate({ path: "member_id", select: "fullName email phone membershipType isActive" })
      .populate({ path: "items.book_id", select: "title author category isbn" })
      .select("-__v");

    const formatResponse = loans.map(formatLoan);
    res.status(200).json(formatResponse);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// GET /api/loans/:id
const getLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).send({ message: `Invalid id: ${id}` });
    }

    const loan = await db.Loan.findById(id)
      .populate({ path: "member_id", select: "fullName email phone membershipType isActive" })
      .populate({ path: "items.book_id", select: "title author category isbn" })
      .select("-__v");

    if (!loan) {
      return res.status(404).send({ message: `Loan with id = ${id} not found` });
    }

    const formatResponse = formatLoan(loan);
    res.status(200).json(formatResponse);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// POST /api/loans/
const createLoan = async (req, res) => {
  try {
    const { member_id, items, dueDate } = req.body;

    // Validate required fields
    if (!member_id || !items || !dueDate) {
      return res.status(400).send({ message: "All fields are required" });
    }

    // Validate member_id format
    if (!isValidId(member_id)) {
      return res.status(400).send({ message: `Invalid member_id: ${member_id}` });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).send({ message: "items must be a non-empty array" });
    }

    // Check member exists and is active
    const member = await db.Member.findById(member_id);
    if (!member) {
      return res.status(404).send({ message: `Member with id = ${member_id} not found` });
    }
    if (!member.isActive) {
      return res.status(400).send({ message: "Only active members are allowed to borrow books" });
    }

    // Validate each item: book exists and has enough copies
    for (const item of items) {
      if (!item.book_id || !item.quantity) {
        return res.status(400).send({ message: "Each item must have book_id and quantity" });
      }
      if (!isValidId(item.book_id)) {
        return res.status(400).send({ message: `Invalid book_id: ${item.book_id}` });
      }
      if (item.quantity < 1) {
        return res.status(400).send({ message: "Quantity must be at least 1" });
      }

      const book = await db.Book.findById(item.book_id);
      if (!book) {
        return res.status(404).send({ message: `Book with id = ${item.book_id} not found` });
      }
      if (book.availableCopies < item.quantity) {
        return res.status(400).send({
          message: `Insufficient copies for book "${book.title}". Available: ${book.availableCopies}, Requested: ${item.quantity}`,
        });
      }
    }

    // Decrease availableCopies for each book
    for (const item of items) {
      await db.Book.findByIdAndUpdate(item.book_id, {
        $inc: { availableCopies: -item.quantity },
      });
    }

    // Create the loan
    const newLoan = new db.Loan({
      member_id,
      items,
      dueDate,
      borrowDate: new Date(),
      status: "Borrowing",
    });
    await newLoan.save();

    // Populate for response
    const populated = await db.Loan.findById(newLoan._id)
      .populate({ path: "member_id", select: "fullName email phone membershipType isActive" })
      .populate({ path: "items.book_id", select: "title author category isbn" })
      .select("-__v");

    const formatResponse = formatLoan(populated);
    res.status(201).json(formatResponse);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { getAllLoans, getLoansByMember, getLoanById, createLoan };

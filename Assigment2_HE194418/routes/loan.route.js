const express = require("express");
const { getAllLoans, getLoansByMember, getLoanById, createLoan } = require("../controllers/loan.controller");

const LoanRouter = express.Router();

// Q3: Loans - /member/:memberId MUST be before /:id to avoid Express conflict
LoanRouter.get("/", getAllLoans);
LoanRouter.get("/member/:memberId", getLoansByMember);
LoanRouter.get("/:id", getLoanById);
LoanRouter.post("/", createLoan);

module.exports = LoanRouter;

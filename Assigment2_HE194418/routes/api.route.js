const express = require("express");

const BookRouter = require("./book.route");
const MemberRouter = require("./member.route");
const LoanRouter = require("./loan.route");

const ApiRouter = express.Router();

// Mount resource routers
ApiRouter.use("/api/books", BookRouter);
ApiRouter.use("/api/members", MemberRouter);
ApiRouter.use("/api/loans", LoanRouter);

module.exports = ApiRouter;

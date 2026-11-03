const express = require("express");
const authRouter = require("./auth.route");
const classRouter = require("./class.route");
const studentRouter = require("./student.route");

const ApiRouter = express.Router();

ApiRouter.use("/api/auth", authRouter);
ApiRouter.use("/api/classes", classRouter);
ApiRouter.use("/api/students", studentRouter);

module.exports = ApiRouter;

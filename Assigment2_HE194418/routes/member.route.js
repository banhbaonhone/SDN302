const express = require("express");
const { getAllMembers, getMemberById, createMember, updateMember, deleteMember } = require("../controllers/member.controller");

const MemberRouter = express.Router();

// Q2: Members CRUD
MemberRouter.get("/", getAllMembers);
MemberRouter.get("/:id", getMemberById);
MemberRouter.post("/", createMember);
MemberRouter.put("/:id", updateMember);
MemberRouter.delete("/:id", deleteMember);

module.exports = MemberRouter;

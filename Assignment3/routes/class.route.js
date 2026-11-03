const express = require("express");
const router = express.Router();
const classController = require("../controllers/class.controller");
const verifyToken = require("../middlewares/verifyToken");

router.get("/:classId/students", verifyToken, classController.getClassStudents);
router.get("/:classId/attendance-summary", verifyToken, classController.getAttendanceSummary);
router.post("/:classId/attendances", classController.recordAttendances);

module.exports = router;

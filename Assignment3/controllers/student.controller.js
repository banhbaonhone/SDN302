const db = require("../models");
const { isValidObjectId } = require("../utils/validate");

// Requirement 4: Get attendance history of a student - HE194418
const getStudentAttendances = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({ error: `Invalid studentId: ${studentId}` });
    }

    const student = await db.Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: `Student with id = ${studentId} not found` });
    }

    const attendances = await db.Attendance.find({ studentId })
      .populate({
        path: "classId",
        populate: { path: "subjectId" },
      })
      .sort({ date: -1 });

    const formatResponse = attendances.map((att) => ({
      id: att._id,
      className: att.classId?.className || "",
      subjectName: att.classId?.subjectId?.name || "",
      date: att.date,
      status: att.status,
    }));

    return res.status(200).json(formatResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getStudentAttendances,
};

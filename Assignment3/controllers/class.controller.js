const db = require("../models");
const { isValidObjectId } = require("../utils/validate");

// Requirement 2: Get students in a class
const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;

    if (!isValidObjectId(classId)) {
      return res.status(400).json({ error: `Invalid classId: ${classId}` });
    }

    const cls = await db.Class.findById(classId).populate("enrollments.studentId");
    if (!cls) {
      return res.status(404).json({ error: `Class with id = ${classId} not found` });
    }

    // status is optional, default value is enrolled
    let { status } = req.query;
    if (!status) {
      status = "enrolled";
    } else {
      status = String(status).toLowerCase();
      if (status !== "enrolled" && status !== "dropped") {
        return res.status(400).json({ error: `Invalid status: ${req.query.status}` });
      }
    }

    const filtered = (cls.enrollments || []).filter(
      (e) => e.status && e.status.toLowerCase() === status && e.studentId
    );

    const formatResponse = filtered.map((e) => ({
      studentId: e.studentId._id,
      id: e.studentId._id,
      studentCode: e.studentId.studentCode,
      fullName: e.studentId.fullName,
      email: e.studentId.email,
    }));

    return res.status(200).json(formatResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Requirement 3: Get attendance summary for enrolled students in a class
const getAttendanceSummary = async (req, res) => {
  try {
    const { classId } = req.params;

    if (!isValidObjectId(classId)) {
      return res.status(400).json({ error: `Invalid classId: ${classId}` });
    }

    const cls = await db.Class.findById(classId).populate("enrollments.studentId");
    if (!cls) {
      return res.status(404).json({ error: `Class with id = ${classId} not found` });
    }

    const enrolledList = (cls.enrollments || []).filter(
      (e) => e.status && e.status.toLowerCase() === "enrolled" && e.studentId
    );

    const attendances = await db.Attendance.find({ classId });
    const statsMap = {};

    for (const att of attendances) {
      const sid = att.studentId?.toString();
      if (!sid) continue;
      if (!statsMap[sid]) {
        statsMap[sid] = { totalSessions: 0, present: 0, absent: 0 };
      }
      statsMap[sid].totalSessions += 1;
      if (att.status === "PRESENT") {
        statsMap[sid].present += 1;
      } else if (att.status === "ABSENT") {
        statsMap[sid].absent += 1;
      }
    }

    const formatResponse = enrolledList.map((e) => {
      const student = e.studentId;
      const sid = student._id.toString();
      const stats = statsMap[sid] || { totalSessions: 0, present: 0, absent: 0 };
      const totalSessions = stats.totalSessions;
      const present = stats.present;
      const absent = stats.absent;
      const rawRate = totalSessions > 0 ? (present / totalSessions) * 100 : 0;
      const attendanceRate = Math.round(rawRate * 10) / 10;
      const warning = attendanceRate < 80;

      return {
        studentId: student._id,
        studentCode: student.studentCode,
        fullName: student.fullName,
        totalSessions,
        present,
        absent,
        attendanceRate,
        warning,
      };
    });

    return res.status(200).json(formatResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Requirement 5: Bulk Attendance Entry with Upsert
const recordAttendances = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date, records } = req.body;

    // 1. Validate classId
    if (!isValidObjectId(classId)) {
      return res.status(400).json({ error: `Invalid classId: ${classId}` });
    }

    // 2. Return 404 if class not found
    const cls = await db.Class.findById(classId).populate("enrollments.studentId");
    if (!cls) {
      return res.status(404).json({ error: `Class with id = ${classId} not found` });
    }

    // 3. Return 400 if date is missing or is a future date
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }
    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }
    const now = new Date();
    if (sessionDate > now) {
      return res.status(400).json({ error: "Date cannot be in the future" });
    }

    // 4. Return 400 if records is missing or empty
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: "Records array is missing or empty" });
    }

    // 5. Get enrolled students
    const enrolledStudents = (cls.enrollments || []).filter(
      (e) => e.status && e.status.toLowerCase() === "enrolled" && e.studentId
    );
    const enrolledMap = new Map();
    for (const e of enrolledStudents) {
      enrolledMap.set(e.studentId._id.toString(), e.studentId);
    }

    // 6. Each studentId must belong to the class with status ENROLLED
    for (const r of records) {
      if (!r.studentId || !enrolledMap.has(String(r.studentId))) {
        return res.status(400).json({
          error: `Student ${r.studentId} does not belong to class`,
        });
      }
    }

    // 7. Missing student check: records must include ALL enrolled students
    const recordStudentIds = new Set(records.map((r) => String(r.studentId)));
    for (const e of enrolledStudents) {
      const sid = e.studentId._id.toString();
      if (!recordStudentIds.has(sid)) {
        return res.status(400).json({
          error: `Missing attendance for student ${e.studentId.studentCode} (${e.studentId.fullName})`,
        });
      }
    }

    // 8. Only accept status values: PRESENT or ABSENT
    for (const r of records) {
      if (!r.status || (r.status !== "PRESENT" && r.status !== "ABSENT")) {
        return res.status(400).json({ error: `Invalid status: ${r.status}` });
      }
    }

    // 9. Upsert attendance records
    const utcDate = new Date(date);
    const startOfDay = new Date(utcDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(utcDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    let updatedCount = 0;
    let present = 0;
    let absent = 0;

    for (const r of records) {
      if (r.status === "PRESENT") present++;
      if (r.status === "ABSENT") absent++;

      const existing = await db.Attendance.findOne({
        classId,
        studentId: r.studentId,
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      if (existing) {
        existing.status = r.status;
        existing.date = startOfDay;
        await existing.save();
        updatedCount++;
      } else {
        await db.Attendance.create({
          classId,
          studentId: r.studentId,
          date: startOfDay,
          status: r.status,
        });
      }
    }

    return res.status(201).json({
      message: "Attendance recorded successfully",
      totalRecords: records.length,
      present,
      absent,
      updatedCount,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getClassStudents,
  getAttendanceSummary,
  recordAttendances,
};

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema
const attendanceSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: "Student" },
  classId: { type: Schema.Types.ObjectId, ref: "Class" },
  date: { type: Date },
  status: { type: String, enum: ["PRESENT", "ABSENT"] },
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema
const enrollmentSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student" },
    status: { type: String, enum: ["enrolled", "dropped"] },
  },
  { _id: false }
);

const classSchema = new Schema({
  className: { type: String },
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
  lecturerName: { type: String },
  status: { type: String },
  enrollments: [enrollmentSchema],
});

const Class = mongoose.model("Class", classSchema);

module.exports = Class;

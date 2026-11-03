const mongoose = require("mongoose");
const Student = require("./student.model");
const Subject = require("./subject.model");
const Class = require("./class.model");
const Attendance = require("./attendance.model");

const db = {};

// Define schema
db.Student = Student;
db.Subject = Subject;
db.Class = Class;
db.Attendance = Attendance;

module.exports = db;

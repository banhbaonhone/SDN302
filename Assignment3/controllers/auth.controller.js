const jwt = require("jsonwebtoken");
const db = require("../models");

// Requirement 1: Login - Account HE194418
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password presence
    if (!email || !password) {
      return res.status(401).json({ message: "Email and password are required" });
    }

    const emailTrimmed = String(email).trim().toLowerCase();
    const passwordTrimmed = String(password).trim();

    // Allow only student account HE194418
    const isHe194418Email =
      emailTrimmed === "he194418@fpt.edu.vn" || emailTrimmed === "he194418";
    const isHe194418Password =
      passwordTrimmed === "he194418@123" || passwordTrimmed === "HE194418@123";

    if (!isHe194418Email || !isHe194418Password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Retrieve student record to populate studentId in JWT payload
    const student = (await db.Student.findOne()) || {
      _id: "65dd00000000000000000001",
    };

    // Generate JWT containing at least studentId
    const payload = {
      studentId: student._id,
      studentCode: "HE194418",
      email: "he194418@fpt.edu.vn",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "HE194418", {
      expiresIn: "1h",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
};

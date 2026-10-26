const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// Validate credentials:
// By default, according to exam instructions: name = storeadmin and pass = Store@123
// If the instructor supplies a different members.json, dynamically validate against that file.
const isValidMember = (name, pass) => {
  const possiblePaths = [
    path.join(__dirname, '../members.json'),
    path.join(__dirname, '../data/members.json'),
    path.join(process.cwd(), 'members.json')
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        const membersList = Array.isArray(data) ? data : [data];
        return membersList.some(
          (m) =>
            (m.name === name || m.username === name) &&
            (m.pass === pass || m.password === pass)
        );
      } catch (err) {
        console.error('Error reading supplied members.json:', err.message);
      }
    }
  }

  // Default credentials as specified in Task 02
  return name === 'storeadmin' && pass === 'Store@123';
};

exports.issueToken = async (req, res) => {
  try {
    const { name, pass, username, password } = req.body;
    const loginName = name || username;
    const loginPass = pass || password;

    if (!loginName || !loginPass) {
      return res.status(401).json({
        message: 'Name and password are required.'
      });
    }

    if (!isValidMember(loginName, loginPass)) {
      return res.status(401).json({
        message: 'Invalid credentials.'
      });
    }

    const payload = {
      name: loginName
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    return res.status(200).json({
      message: 'Authentication successful',
      token
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Import the jsonwebtoken library
const { check, validationResult } = require("express-validator");

require("dotenv").config(); // Load environment variables from a .env file

const app = express();
const port = process.env.PORT || 3000;

// MySQL database connection
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync("ca.pem"),
    rejectUnauthorized: true,
  },
});

app.use(bodyParser.json());
app.use(cors({ origin: "https://web009.wifiooe.at" })); // Specify your frontend domain

// Secret key for signing JWTs
const jwtSecretKey = process.env.JWT_SECRET_KEY || "magomedstinky123"; // Replace with a secure secret key

// Create the database and table if they don't exist
connection.query(
  `
  CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};
  USE ${process.env.DB_NAME};
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
  );
`,
  (err) => {
    if (err) {
      console.error("Error creating database and table:", err);
    } else {
      console.log("Database and table are ready");
    }
  }
);

// Login endpoint
app.post("/login", [check("username").notEmpty().escape(), check("password").notEmpty()], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  // Hash the password before checking in the database
  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  connection.query(query, [username, hashedPassword], (err, results) => {
    if (err) {
      console.error("Error executing MySQL query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length > 0) {
      // Create and sign a JWT for successful login
      const token = jwt.sign({ username }, jwtSecretKey, { expiresIn: "1h" });
      res.json({ success: true, message: "Login successful", token });
    } else {
      res.status(401).json({ success: false, message: "Invalid username or password" });
    }
  });
});

// Registration endpoint
app.post("/register", [check("username").notEmpty().escape(), check("password").notEmpty()], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  // Hash the password before storing in the database
  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = "INSERT INTO users (username, password) VALUES (?, ?)";
  connection.query(query, [username, hashedPassword], (err, results) => {
    if (err) {
      console.error("Error executing MySQL query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json({ success: true, message: "Registration successful" });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

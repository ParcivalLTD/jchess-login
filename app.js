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
    ca: `-----BEGIN CERTIFICATE-----
    MIIEQTCCAqmgAwIBAgIUJbiBKqHPdUgXitN6k9hw5zdOL6owDQYJKoZIhvcNAQEM
    BQAwOjE4MDYGA1UEAwwvM2MyZTBhNWYtMGI3NS00ZDZkLWI4NDItNTM2YWMyOGE3
    MjQxIFByb2plY3QgQ0EwHhcNMjMxMjE2MTY1OTQ3WhcNMzMxMjEzMTY1OTQ3WjA6
    MTgwNgYDVQQDDC8zYzJlMGE1Zi0wYjc1LTRkNmQtYjg0Mi01MzZhYzI4YTcyNDEg
    UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAM+rWwOe
    EEJyrPmH1slkoZr9b0KQkkb0GPm+Ny0AkzInxHTXxV5xvo7fYd3sLDbOdEfQvR3c
    HAKSadwe6tHkcSf4BVOCSOU6liVC93tuNrZMg0eBnXkK1yX5RNldpwRdXiuMVLUn
    5oy2Kr5GOwcQg7sPDAAo+Ckr9rBocO/Qbs2jpmTBfHsZHzd0hNaA2IMfXw5FHdMS
    Og/mzi3ln7M1U+jkOkKMIipdGF2valgSOU0+RQZQ8GEpCstdbc/uc4mZJyy6v5kF
    VNIVK042q/T/ovQYsnGP0wlbfaNjINYuakOHgxjoCdB55qwOhvvVEJwG+sQW5w59
    qTmZ/oely9HhTuuiPJ91GxKNC19YxtkbmbX9jcpuZQ2MtKGfeXwy50Xvn/QBnpC1
    YIaEgOTMv3k/3Vk2qmCSBp5fs+6QCPWAcnqHFB2oSmJ32thJqmbmbnYheT1Dxpm8
    keXQryZoW+9Ir+NNydkSJMn6LMdV1iL4uHWsBSz5Fo9RvN/wt24Y025tUQIDAQAB
    oz8wPTAdBgNVHQ4EFgQUemVKrBYVw6UhyM4xqThvaVVIuRowDwYDVR0TBAgwBgEB
    /wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAB07CAw88LTBwGD6
    NY/LI4CVVeHQmMvHZfszwOTSOlq/pUgJFmC0LDjRsuZY42P+hTE5hnSiTEcBP2tk
    QAAwUwK/5PfaA5qDidI/OSGSSHs4+ORe02CrRPnqZrOVnBeJjgziMH3ayHCbIOAW
    i/bZxaXvmijIyRltY6x+g+4xzXy/ckW2WmYJI6EPbuGNAUy3s+plH3piWBwZ7nha
    URnty4Znmfp4ZpgfdHudQxCNOxlGqoX+AJUvWEk06jmha9wTSCS0CwK1y2PK1N9o
    Y27DJAwayQlpo8RY0DKENuJ8O1j9kOjXbGpy5JzkXOgMOAe/yaUarlgB+CSmUy+a
    YJEBRStoZjxKuguLs76n45UfR446a3J6KNg8rodaB2j2Jgp0DOQ3xJBB5fOhB7Iy
    ogXfO+kc4CFGHAwM1rkzVNmGvhP3Y37tkIr/hQyUNYIhRU+sjJ5zL4t7gFKtTiQf
    L6RoprGh6FAL24UKmG4UCzhzwDPv5ViN8ISvxiPn4+yNCi2SYw==
    -----END CERTIFICATE-----
    `,
  },
});

app.use(bodyParser.json());
app.use(cors({ origin: "https://web009.wifiooe.at" })); // Specify your frontend domain

// Secret key for signing JWTs
const jwtSecretKey = process.env.JWT_SECRET_KEY || "magomedstinky123"; // Replace with a secure secret key

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

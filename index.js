const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const fs = require("fs/promises");
const cors = require("cors"); // Add this line

const app = express();
const PORT = 3000;
const dbFile = "users.json";

app.use(cors()); // Add this line to enable CORS
app.use(bodyParser.json());

// Register a new user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Load existing users from the database
    const users = JSON.parse(await fs.readFile(dbFile, "utf-8"));

    // Check if the username is already taken
    if (users.find((user) => user.username === username)) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user to the database
    users.push({ username, password: hashedPassword });
    await fs.writeFile(dbFile, JSON.stringify(users));

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Load existing users from the database
    const users = JSON.parse(await fs.readFile(dbFile, "utf-8"));

    // Find the user with the given username
    const user = users.find((user) => user.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Initialize the database file if it doesn't exist
(async () => {
  try {
    await fs.access(dbFile);
  } catch (error) {
    // File doesn't exist, initialize an empty array
    await fs.writeFile(dbFile, "[]");
  }
})();

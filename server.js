const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import the cors package
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

const users = [];

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username is already taken
  if (users.some((user) => user.username === username)) {
    return res.status(400).json({ error: "Username is already taken" });
  }

  // Store user information (you might want to hash the password for security)
  users.push({ username, password });

  res.status(200).json({ message: "Registration successful" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if user exists and credentials match (you might want to hash the password for security)
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.status(200).json({ message: "Login successful" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

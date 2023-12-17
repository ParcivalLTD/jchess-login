const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// Verbindung zu MongoDB
mongoose.connect("mongodb+srv://juliangabriel570:kcXARmNXxDcdvMNF@cluster0.76zba9m.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model("User", UserSchema);

app.use(express.json());

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Missing username or password");
  }

  const user = new User({ username, password });
  await user.save();

  res.status(201).send("User registered");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send("Invalid username or password");
  }

  const token = jwt.sign({ id: user._id }, "secret", { expiresIn: "1h" });

  res.send({ token });
});

app.post("/logout", (req, res) => {
  // In einer echten Anwendung würden Sie hier das Token auf der Blacklist setzen
  res.send("Logged out");
});

app.listen(3000, () => console.log("Server running on port 3000"));

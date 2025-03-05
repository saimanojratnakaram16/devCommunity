const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUp } = require("./utils/validate");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  try {
    const validationErrors = validateSignUp(req);

    if (validationErrors) {
      return res.status(400).json({ errors: validationErrors });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ emailId: req.body.emailId });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    const { firstName, lastName, emailId, gender, age, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user instance
    const user = new User({
      firstName,
      lastName,
      emailId,
      gender,
      age,
      password: passwordHash,
    });

    // Save user to database
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error saving user:", err);

    // Handle validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  const { emailId, password } = req.body;

  try {
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).send("Invalid credentials");
    }

    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }
    const expiresIn = 24 * 60 * 60 * 1000;
    const token = await user.getJWT();
    res.cookie("token", token, { expires: new Date(Date.now() + expiresIn) });
    res.send("LogIn successfull");
  } catch (err) {
    console.error("Error logging in", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).send("User not found");
    }
    res.send(user);
  } catch (err) {
    console.error("Error fetching user", err);
    res.status(400).send("Something went wrong");
  }
});

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    console.error("Error fetching user", err);
    res.status(400).send("Something went wrong");
  }
});

app.delete("/user/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      res.status(404).send("User not found");
    }
    res.send("User deleted successfully");
  } catch (err) {
    console.error("Error deleting user", err);
    res.status(400).send("Error deleting user");
  }
});

app.patch("/user/:id", async (req, res) => {
  const userId = req.params?.id;
  if (!userId) {
    return res.status(400).send({ error: "User ID is required" });
  }

  try {
    const data = req.body;
    const ALLOWED_UPDATES = [
      "lastName",
      "firstName",
      "age",
      "gender",
      "photoUrl",
      "skills",
    ];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("Invalid updates");
    }
    const user = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.status(200).send(user);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(400).send({ error: "Failed to update user" });
  }
});

const startServer = async () => {
  await connectDB();
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
};

startServer();

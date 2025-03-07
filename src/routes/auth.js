const express = require("express");
const { validateSignUp } = require("../utils/validate");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const router = express.Router();

router.post("/signup", async (req, res) => {
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

router.post("/login", async (req, res) => {
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

router.post("/logout", async(req,res)=>{
    res.cookie("token",null, {expires: new Date(Date.now())});
    res.send("Logged out successfully");
})

module.exports = router;

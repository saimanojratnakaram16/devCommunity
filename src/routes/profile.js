const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validate");
const bcrypt = require("bcrypt");

router.get("/profile/view", userAuth, async (req, res) => {
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

router.patch("/profile/edit",userAuth, async (req, res) => {
  const user = req.user;
  try {
    if(!validateEditProfileData(req.body)){
        throw new Error("Invalid edit request");
    }
    Object.keys(req.body).forEach(key => user[key]=req.body[key]);
    await user.save();
    res.json({
        message: "Profile updated successfully",
        data: user
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(400).send("ERROR: "+err.message);
  }
});

router.patch("/profile/password",userAuth, async (req, res) => {
  const user = req.user;
  try {
    const { currPassword, newPassword } = req.body;
    const isPasswordValid = await user.validatePassword(currPassword);
    if (!isPasswordValid) {
      return res.status(400).send("Incorrect current password");
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({
        message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(400).send("ERROR: Failed to update the password");
  }
});
module.exports = router;

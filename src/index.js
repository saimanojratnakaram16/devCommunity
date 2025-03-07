const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);

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

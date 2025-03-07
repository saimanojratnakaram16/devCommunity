const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const router = express.Router();

const SAFE_USER_DATA = [
  "firstName",
  "lastName",
  "photoUrl",
  "gender",
  "skills",
];

router.get("/user/requests/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequest = await ConnectionRequest.find({
      receiverId: loggedInUser._id,
      status: "interested",
    }).populate("senderId", SAFE_USER_DATA);

    res.status(200).send(connectionRequest);
  } catch (err) {
    console.error("Error fetching user requests", err);
    res.status(400).send("ERROR: " + err.message);
  }
});

router.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequest.find({
      $or: [{ senderId: loggedInUser._id }, { receiverId: loggedInUser._id }],
      status: "accepted",
    })
      .populate("senderId", SAFE_USER_DATA)
      .populate("receiverId", SAFE_USER_DATA);

    const data = connections.map((connection) => {
      if (connection.senderId._id.toString() === loggedInUser._id.toString())
        return connection.receiverId;
      return connection.senderId;
    });
    res.status(200).send(data);
  } catch (err) {
    console.error("Error fetching user connections", err);
    res.status(400).send("ERROR: " + err.message);
  }
});

router.get("/feed", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const page = Math.abs(parseInt(req.query.page) || 1);
    let limit = Math.abs((parseInt(req.query.limit)) || 10);
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ receiverId: user._id }, { senderId: user._id }],
    });

    const alreadyConnectedUsers = new Set();

    connectionRequests.forEach(({ receiverId, senderId }) => {
      alreadyConnectedUsers.add(receiverId.toString());
      alreadyConnectedUsers.add(senderId.toString());
    });

    const users = await User.find({
      _id: {
        $nin: Array.from(alreadyConnectedUsers),
        $ne: user._id,
      },
    }).select(SAFE_USER_DATA).skip(skip).limit(limit);
    res.status(200).send(users);
  } catch (err) {
    console.error("Error fetching user feed", err);
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = router;

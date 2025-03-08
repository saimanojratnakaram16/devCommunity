const express = require("express");
const router = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const { userAuth } = require("../middlewares/auth");
router.post("/request/send/:status/:receiverId", userAuth, async (req, res) => {
  try {
    const senderId = req.user._id;
    const {receiverId, status} = req.params;

    const allowedStatus = ["interested", "ignored"];

    if (!allowedStatus.includes(status)) {
      throw new Error("Invalid status");
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).send({ error: "User not found" });
    }

    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        {
          senderId: receiverId,
          receiverId: senderId,
        },
        {
          senderId,
          receiverId,
        },
      ],
    });

    if(existingRequest){
        throw new Error("Connection Request already exists");
    }

    const connectionRequest = new ConnectionRequest({
      senderId,
      receiverId,
      status,
    });

    await connectionRequest.save();
    res.status(201).send("connection Request sent successfully");
  } catch (e) {
    res.status(400).send("ERROR: " + e.message);
  }
});

router.post("/request/review/:status/:requestId", userAuth, async (req,res)=>{
    try{
        const user = req.user;
        const allowedStatus = ['accepted','rejected'];

        if(!allowedStatus.includes(req.params.status)){
            throw new Error("Invalid status");
        }

        const {status, requestId} = req.params;

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            receiverId: user._id,
            status: 'interested'
        });

        if(!connectionRequest){
            throw new Error("Connection request not found");
        }

        connectionRequest.status = status;

        await connectionRequest.save();
        res.status(200).send("Connection Request reviewed successfully");

    }catch (e) {
        res.status(400).send("ERROR: " + e.message);
    }

})

module.exports = router;

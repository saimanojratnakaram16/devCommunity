const mongoose = require('mongoose');

const connectionRequestSchema  = mongoose.Schema(
    {
        senderId: {
            required: true,
            ref: 'User',
            type: mongoose.Schema.Types.ObjectId,
        },
        receiverId:{
            required: true,
            ref: 'User',
            type: mongoose.Schema.Types.ObjectId
        },
        status: {
            type: String,
            enum: ["ignored", "interested", "accepted", "rejected"],
        }
    },
    {
        timestamps: true,
    }
);

connectionRequestSchema.pre('save', function(next){
    const connectionRequest = this;
    if(connectionRequest.senderId.equals(connectionRequest.receiverId)){
        return next(new Error('Cannot sent connection request to yourself'));
    }
    next();
});

connectionRequestSchema.index({receiverId: 1, senderId : 1 }, { unique: true })

const ConnectionRequestModel = new mongoose.model('ConnectionRequest', connectionRequestSchema);

module.exports = ConnectionRequestModel;
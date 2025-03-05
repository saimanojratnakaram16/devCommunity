const mongoose = require('mongoose');

const connectDB = async()=>{
    try{
        await mongoose.connect(
            'mongodb+srv://saimanojratnakaram16:Icp86eCMRNuV3XKs@dev-community.ezt1v.mongodb.net/dev-community'
             );
        console.log("Connected to MongoDB");
    }catch(e){
        console.log("Failed to connect to MongoDB", e);
    }
}

module.exports =  connectDB;

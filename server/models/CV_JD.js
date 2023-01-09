const User = require("../models/Users")

const mongoose = require("mongoose")
const CV_JD_Schema = new mongoose.Schema({
	processed_JD_ID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "processed_JD",
        required: true
    },
    processed_CV_ID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "processed_CV",
        required: true
    },
    weighted_percentage:{
        type: Number,
        required: true
    },
    rank:{
        type: Number, 
        reuired: true
    }
    
},
    {
	timestamps:true
    })
    
module.exports = mongoose.model('CV_JD', CV_JD_Schema)    
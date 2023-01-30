const User = require("../models/Users")

const mongoose = require("mongoose")
const CV_JD_Schema = new mongoose.Schema({
	JD_ID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "jds",
        required: true
    },
    CV_ID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "cvs",
        required: true
    },
    weighted_percentage:{
        type: Number,
        required: true
    },
    rank:{
        type: Number, 
        reuired: true
    },
    hire_status:{
        type: String,
        requires: true,
        enum: ["Rejected", "Pending", "Accepted"]
    }
    
},
    {
	timestamps:true
    })
    
module.exports = mongoose.model('cvs_jds', CV_JD_Schema)    
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
    hire_status:{
        type: String,
        required: true,
        enum: ["Rejected", "Pending", "Accepted"],
        default: "Pending",
    },
    is_active_cv_jd:{
        type: Boolean,
        default: true
    }
},
    {
	timestamps:true
    })
    
module.exports = mongoose.model('cvs_jds', CV_JD_Schema)    
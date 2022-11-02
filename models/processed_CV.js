const User = require("../models/Users")

const mongoose = require("mongoose")
const Processed_JD_Schema = new mongoose.Schema({
	CV_ID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CVs",
        required: true
    },
    technical_skills:{
        type: String,
        required: true
    },
    experiance:{
        type: String,
        required: true
    },
    personal_projects:{
        type: String,
        required: true
    },
    professional_projects:{
        type: String,
        required: true
    },
    qualfication:{
        type: String,
        required: true
    },
    research_areas:{
        type: String,
        required: true
    },
    professional_skills:{
        type: String,
        required: true
    },
    activities:{
        type: String,
        required: true
    },
    links:{
        type: [String],
        required: true
    },
    contact_information:{
        type: [String],
        required: true
    }
    
},
    {
	timestamps:true
    })
    
module.exports = mongoose.model('Processed_JD', Processed_JD_Schema)    
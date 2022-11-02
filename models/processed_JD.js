const User = require("./Users")

const mongoose = require("mongoose")
const Processed_JD_Schema = new mongoose.Schema({
	JD_ID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JDs",
        required: true
    },
    skills:{
        type: String,
        required: true
    },
    qualification:{
        type: String,
        required: true
    },
    experiance:{
        type: String,
        required: true
    },
    research_area:{
        type: String,
        required: false
    }
},
    {
	timestamps:true
    })
    
module.exports = mongoose.model('Processed_JD', Processed_JD_Schema)    
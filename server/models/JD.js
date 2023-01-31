const mongoose = require("mongoose")
const User = require("../models/Users")
const JDsSchema = new mongoose.Schema({
	// jd_url:{
	//   type: String,
	//   required: true
    // },
	position:{
	  type: String,
	  required: true
    },
    is_active:{
        type: Boolean,
        required: true,
        default: true
    },
    // upload_date:{
    //     type: Date,
    //     required: true
    // },
    department:{
        type: String,
        required: true
    },
    uploaded_by:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    skills:{
        type: [String],
        required: true
    },
    experience:{
        type: Number,
        required: true
    },
    qualification:{
        type: String,
        required: true
    },
    universities:{
        type: [String],
        required: true
    }
    
},
    {
	timestamps:true
    })
    
module.exports = mongoose.model('jds', JDsSchema)    
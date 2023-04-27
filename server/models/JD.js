const mongoose = require("mongoose")
const User = require("../models/Users")
const JDsSchema = new mongoose.Schema({
	position:{
	  type: String,
	  required: true
    },
    is_active:{
        type: Boolean,
        required: true,
        default: true
    },
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
        type: [Object],
        required: true
    },
    experience:{
        type: String,
        required: true
    },
    qualification:{
        type: Object,
        required: true
    },
    universities:{
        type: Object,
        required: true
    }
    
},
    {
	timestamps:true
    })
    
module.exports = mongoose.model('jds', JDsSchema)    
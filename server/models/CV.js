const mongoose = require("mongoose")
const User = require("../models/Users")
const CVsSchema = new mongoose.Schema({
	cv_path:{
	  type: String,
	  required: true
    },
    skills:{
        type: [String],
        required: true
    },
    experience:{
        type: String,
        required: true
    },
    qualification:{
        type: String,
        required: true
    },
    links:{
        type: [String],
        required: false 
    },
    emails:{
        type: [String],
        required: true
      //match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'This is not a valid email address'
    },
    phone_number:{
        type: String,
        required: true
    },
    full_name:{
        type: String,
        required: true
    },
    uploaded_by:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
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
    var validateEmail = function(email) {
        var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return re.test(email)
    };
module.exports = mongoose.model('cvs', CVsSchema)    
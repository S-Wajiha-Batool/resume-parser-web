const mongoose = require("mongoose")
const User = require("../models/Users")
const CVsSchema = new mongoose.Schema({
	cv_url:{
	  type: String,
	  required: true
    },
	position:{
	  type: String,
	  required: true
    },
    // upload_date:{
    //     type: Date,
    //     required: true
    // },
    department:{
        type: String,
        required: true
    },
    skills:{
        type: [String],
        required: true
    },
    experiance:{
        type: Number,
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
    email:{
        type: String,
        required: true,
        unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
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
const mongoose = require("mongoose")
const OTPSchema = new mongoose.Schema({	
	email:{
	  type: String,
	  required: true,
    },
	password:{
	  type: String,
	  minlength: 8
    },
	expires_in:{
	  type: Number,
	  required: true,	  
	},
	code:{
	  type: String
	}
},
    {
	timestamps:true
    })


module.exports = mongoose.model('otp', OTPSchema, 'otp')    
const mongoose = require("mongoose")
const usersSchema = new mongoose.Schema({
	first_name:{
	  type: String,
	  required: true,
	  trim: true
    },
	last_name:{
	  type: String,
	  required: false,
      trim: true
    },
	email:{
	  type: String,
	  required: true,
	  unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
	password:{
	  type: String,
	  required: true,
	  minlength: 8
    },
	user_role:{
	  type: Number,
	  required: true,
      enum: [0, 1, 2],
	  
	},
	token:{
	  type: String
	},
	is_active:{
		type: Boolean,
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
module.exports = mongoose.model('Users', usersSchema)    
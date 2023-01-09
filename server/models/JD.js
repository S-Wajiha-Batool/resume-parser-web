const mongoose = require("mongoose")
const JDsSchema = new mongoose.Schema({
	text:{
	  type: String,
	  required: true
    },
	position_name:{
	  type: String,
	  required: true
    },
    is_active:{
        type: Boolean,
        required: true
    },
    upload_date:{
        type: Date,
        required: true
    }
},
    {
	timestamps:true
    })
    
module.exports = mongoose.model('JDs', JDsSchema)    
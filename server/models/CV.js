const mongoose = require("mongoose")
const CVsSchema = new mongoose.Schema({
	CV:{
	  type: String,
	  required: true
    },
	position_name:{
	  type: String,
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
    
module.exports = mongoose.model('CVs', CVsSchema)    
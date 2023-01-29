const mongoose = require("mongoose")
const JDsSchema = new mongoose.Schema({
	jd_url:{
	  type: String,
	  required: true
    },
	position_name:{
	  type: String,
	  required: true
    },
    is_active:{
        type: Boolean,
        required: true,
        default: true
    },
    upload_date:{
        type: Date,
        required: true
    },
    department_name:{
        type: String,
        required: true
    },
    uploaded_by:{
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
    }
    
},
    {
	timestamps:true
    })
    
module.exports = mongoose.model('JD', JDsSchema)    
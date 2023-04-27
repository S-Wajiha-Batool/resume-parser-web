const mongoose = require("mongoose")
const User = require("../models/Users")
const CVsSchema = new mongoose.Schema({
    cv_path: {
        type: String,
        required: true
    },
    cv_original_name: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        required: true
    },
    experience_by_jobs: {
        type: Map,
        of: String,
    },
    total_experience: {
        type: Number,
    },
    links: {
        type: [String],
        required: false
    },
    emails: {
        type: [String],
        required: true
    },
    phone_number: {
        type: String,
        required: true,
        minlength: 0
    },
    full_name: {
        type: String,
        required: true,
        minlength: 0
    },
    uploaded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    is_active: {
        type: Boolean,
        required: true,
        default: true
    },
},
    {
        timestamps: true
    })
module.exports = mongoose.model('cvs', CVsSchema)    
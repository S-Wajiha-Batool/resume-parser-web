const express = require("express");
const User = require("../Project/models/Users")
const users_route = require("../Project/APIs/Users")
const jds_route = require("../Project/APIs/JD")
const cvs_route = require("../Project/APIs/CV")
const app = express();
const cors = require("cors")

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config()
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("DB Connection successfull"))
.catch((err) => {
    console.log(err);
});

app.use(cors());
app.use(express.json());
app.use("/resume_parser", users_route); 
app.use("/resume_parser", jds_route);
app.use("/resume_parser", cvs_route);
app.use("/uploaded_JDs", express.static('uploaded_JDs'))
app.use("/uploaded_CVs", express.static('uploaded_CVs'))
app.listen(process.env.PORT || 3002, () =>{
    console.log("server is running");
});




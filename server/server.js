const express = require("express");
const app = express();
const cors = require("cors")
const cookieparser = require("cookie-parser")
const dotenv = require("dotenv");
const bodyParser = require('body-parser')
const mongoose = require("mongoose");

const jds_route = require("./controllers/JDController")
const cvs_route = require("./controllers/CVController")

dotenv.config()
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("DB Connection successfull"))
.catch((err) => {
    console.log(err);
});

app.use(cors());
app.use(express.json());
app.use(cookieparser());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}));

app.use('/api/user', require('./routes/userRouter'))

app.use("/resume_parser", jds_route);
app.use("/resume_parser", cvs_route);
app.use("/uploaded_JDs", express.static('uploaded_JDs'))
app.use("/uploaded_CVs", express.static('uploaded_CVs'))
app.listen(process.env.PORT || 3002, () =>{
    console.log("server is running");
});




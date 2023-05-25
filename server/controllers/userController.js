const router = require('express').Router();
const User = require("../models/Users")
const Otp = require("../models/OTP")
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { spawn } = require('child_process');
var request = require('request-promise');

const userController = {
    login: async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.status(401).json({ error: { code: 401, msg: "Wrong email" }, data: null })
            }
            const decrypted_password = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);

            const pass = decrypted_password.toString(CryptoJS.enc.Utf8);

            if (pass != req.body.password) {
                return res.status(401).json({ error: { code: 401, msg: "Wrong password" }, data: null })
            }

            const accessToken = createAccessToken({ id: user._id })
            if (!accessToken) return res.status(404).json({ error: { code: res.statusCode, msg: 'No access token' }, data: null })

            const refreshToken = createRefreshToken({ id: user._id })
            if (!accessToken) return res.status(404).json({ error: { code: res.statusCode, msg: 'No refresh token' }, data: null })


            res.cookie('refreshtoken', refreshToken, {
                httpOnly: true,
                path: '/api/user/refresh_token',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            return res.status(200).json({ error: { code: null, msg: null }, data: { accessToken: accessToken } })


        }
        catch (err) {
            return res.status(500).json({ error: { code: 500, msg: err }, data: null })
        }
    },

    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', { path: '/api/user/refresh_token' })
            return res.status(200).json({ error: { code: null, msg: null }, data: "Successfully Logged out" })
        }
        catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null })
        }
    },

    profile: async (req, res) => {
        try {
            var user = {};
            if (req.params.id) {
                user = await User.findOne({ _id: req.params.id });
            }
            else {
                user = await User.findOne({ _id: req.user.id });
            }
            const { user_role, is_active, token, createdAt, updatedAt, __v, ...others } = user._doc;
            return res.status(200).json({ error: { code: null, msg: null }, data: others })
        }
        catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null })
        }
    },

    sendEmail: async (req, res) => {
        try {
            let user_email = req.body.email;
            console.log(user_email)
            if (!user_email) return res.status(404).json({ error: { code: 404, msg: "No email found" }, data: null })

            let user = await User.findOne({ email: user_email });

            if (!user) return res.status(404).json({ error: { code: 404, msg: "No user found" }, data: null })
            console.log(user)
            let otpCode = Math.floor((Math.random() * 10000) + 1);
            let otpData = new Otp({
                email: user_email,
                code: otpCode,
                expires_in: new Date().getTime() + 300 * 1000 //5 mins
            })

            let otpResponse = await otpData.save();
            if (!otpResponse) return res.status(404).json({ error: { code: 404, msg: "Error in generating OTP. Please try again" }, data: null })

            mailer(user_email, otpCode)
            return res.status(200).json({ error: { code: null, msg: null }, data: "OTP generated successfully" })
        }
        catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null })
        }
    },

    changePassword: async (req, res) => {
        try {
            let { user_email, user_otp, user_password } = req.body;

            if (!user_email) return res.status(404).json({ error: { code: 404, msg: "Email not found" }, data: null })
            if (!user_otp) return res.status(404).json({ error: { code: 404, msg: "OTP not found" }, data: null })
            if (!user_password) return res.status(404).json({ error: { code: 404, msg: "Password not found" }, data: null })
            if (user_password.length < 8) return res.status(200).json({ error: { code: 404, msg: "Password should be atleast 8 characters long" }, data: null })

            let otp = await Otp.findOne({ email: user_email, code: user_otp });

            if (!otp) return res.status(404).json({ error: { code: 404, msg: "Invalid OTP" }, data: null })

            let currentTime = new Date().getTime();
            let diff = otp.expires_in - currentTime;
            if (diff < 0) return res.status(404).json({ error: { code: 404, msg: "OTP expired" }, data: null })

            let user = await User.findOne({ email: user_email })
            user.password = CryptoJS.AES.encrypt(user_password, process.env.SECRET_KEY)
            let saved_user = await user.save();

            if (!saved_user) return res.status(404).json({ error: { code: 404, msg: "Error in updating password. Please try again" }, data: null })
            return res.status(200).json({ error: { code: null, msg: null }, data: "Password changed successfully" })
        }
        catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null })
        }
    },

    createUser: async (req, res) => {
        const loggedin_user = await User.findOne({ _id: req.user.id });
        const newUser = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY),
            user_role: req.body.user_role,
            is_active: req.body.is_active
        });
        if (loggedin_user.user_role == 0) {
            try {

                const savedUser = await newUser.save()
                return res.status(200).json({ error: { code: null, msg: null }, data: "Successfully Logged out" })
            } catch (err) {
                res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null });
            }
        }
        else if (loggedin_user.user_role == 1) {
            if (newUser.user_role !== 2) {
                res.status(403).json({ error: { code: res.statusCode, msg: "Permission Denied" }, data: null })
            }
            else {
                try {
                    const savedUser = await newUser.save()
                    res.status(200).json({ error: { code: null, msg: null }, data: "User Registered" });
                } catch (err) {
                    res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null });
                }

            }
        }
        else if (loggedin_user.user_role == 2) {
            res.status(403).json({ error: { code: res.statusCode, msg: "Permission Denied" }, data: null })
        }
    },

    getAllUsers: async (req, res) => {
        const user = await User.findOne({ _id: req.user.id });
        if (user.user_role == 0) {
            if (!req?.query?.id) {
                const all_users = await User.find();
                res.status(200).json({ error: { code: null, msg: null }, data: all_users });
            }
            else {
                const selected_user = await User.findById({ _id: req.query.id });
                res.status(200).json({ error: { code: null, msg: null }, data: selected_user })
            }
        }
        else if (user.user_role == 1) {
            if (!req?.query?.id) {
                const all_users = await User.find({ user_role: { $eq: 2 } })
                res.status(200).json({ error: { code: null, msg: null }, data: all_users });
            }
            else {
                const selected_user = await User.findById({ _id: req.query.id });
                if (selected_user.user_role !== 2) {
                    res.status(403).json({ error: { code: res.statusCode, msg: "Permission Denied" }, data: null })
                }
                else {
                    res.status(200).json({ error: { code: null, msg: err }, data: selected_user });
                }
            }
        }
        else if (user.user_role == 2) {
            if (req.query.id) {
                res.status(403).json({ error: { code: res.statusCode, msg: "Permission Denied" }, data: null })
            }
            else {
                const { user_role, is_active, token, createdAt, updatedAt, __v, ...others } = user._doc;
                res.status(200).json({ error: { code: null, msg: null }, data: others });
            }
        }
        else {
            res.status(403).json({ error: { code: res.statusCode, msg: "Permission Denied" }, data: null })
        }
    },

    updateUser: async (req, res) => {
        const loggedin_user = await User.findOne({ _id: req.user.id })
        if (loggedin_user.user_role == 0) {
            try {
                if (req.body.password) {
                    req.body.password = CryptoJS.AES.encrypt(
                        req.body.password,
                        process.env.SECRET_KEY
                    ).toString();
                }
                const updatedUser = await User.findByIdAndUpdate(
                    req.params.id,
                    {
                        $set: req.body,
                    },
                    { new: true }
                );
                res.status(200).json({ error: { code: null, msg: null }, data: updated_user });
            } catch (err) {
                res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null });
            }
        }
        else if (loggedin_user.user_role == 1) {
            const selected_user = await User.findById(req.params.id);
            if (selected_user.user_role !== 2) {
                if (req.params.id == loggedin_user.id) {
                    if (req.body.email || req.body.is_active || req.body.user_role) {
                        res.status(403).json({ error: { code: res.statusCode, msg: "Permission Denied" }, data: null })
                    }
                    else {
                        try {
                            if (req.body.password) {
                                req.body.password = CryptoJS.AES.encrypt(
                                    req.body.password,
                                    process.env.SECRET_KEY
                                ).toString();
                            }
                            const updatedUser = await User.findByIdAndUpdate(
                                req.params.id,
                                {
                                    $set: req.body,
                                },
                                { new: true }
                            );
                            res.status(200).json({ error: { code: null, msg: null }, data: updatedUsers });
                        } catch (err) {
                            res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null });
                        }
                    }
                }
                else {
                    res.status(403).json({ error: { code: res.statusCode, msg: "Permission Denied" }, data: null })
                }
            }
            else {
                try {
                    const updatedUser = await User.findByIdAndUpdate(
                        req.params.id,
                        {
                            $set: req.body,
                        },
                        { new: true }
                    );
                    res.status(200).json({ error: { code: null, msg: null }, data: updatedUsers });
                } catch (err) {
                    res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null });
                }

            }
        }
        else if (loggedin_user.user_role == 2) {
            if (req.params.id == loggedin_user.id) {
                if (req.body.email || req.body.is_active || req.body.user_role) {
                    res.status(403).json({ error: { code: res.statusCode, msg: "Permission Denied" }, data: null })
                }

                else {
                    if (req.body.password) {
                        req.body.password = CryptoJS.AES.encrypt(
                            req.body.password,
                            process.env.SECRET_KEY
                        ).toString();
                    }

                    try {
                        const updatedUser = await User.findByIdAndUpdate(
                            req.params.id,
                            {
                                $set: req.body,
                            },
                            { new: true }
                        );
                        res.status(200).json({ error: { code: null, msg: null }, data: updatedUser });
                    } catch (err) {
                        res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null });
                    }
                }
            }
            else {
                res.status(403).json({ error: { code: res.statusCode, msg: "Permission Denied" }, data: null })
            }

        }
        else {
            res.status(403).json({ error: { code: res.statusCode, msg: "Permission Denied" }, data: null })
        }
    },

    refreshToken: async (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken;

            if (!rf_token) return res.status(404).json({ error: { code: res.statusCode, msg: 'Please login or register' }, data: null })

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) return res.status(500).json({ error: { code: res.statusCode, msg: 'Please login or register' }, data: null })


                const accessToken = createAccessToken({ id: user.id })
                return res.status(200).json({ error: { code: null, msg: null }, data: accessToken })
            })

        } catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null })
        }
    },


}

const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
}

const createRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' })
}

const mailer = (email, otp, res) => {
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        auth: {
            user: "tnasir13579@gmail.com",
            pass: "truszmziiomcukvp"
        }
    })

    var mailOptions = {
        from: "tnasir13579@gmail.com",
        to: email,
        subject: "Password Reset Link",
        text: `Hello! Use the following OTP to reset your password : ${otp}. Please note that the OTP will expire in 5 minutes.`
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
            return res.status(404).json({ error: { code: 404, msg: "Error in sending email. Please try again" }, data: null })
        }
        else {
            console.log("Email sent " + info.response)
        }
    })
}


module.exports = userController

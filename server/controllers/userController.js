const router = require('express').Router();
const User = require("../models/Users")
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { spawn } = require('child_process');

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
        const user = await User.findOne({ _id: req.user.id });
        const { user_role, is_active, token, createdAt, updatedAt, __v, ...others } = user._doc;
        return res.status(200).json({ error: { code: null, msg: null }, data: others })
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
                res.status(500).json({ error: {code: res.statusCode, msg: err}, data: null });
            }
        }
        else if (loggedin_user.user_role == 1) {
            if (newUser.user_role !== 2) {
                res.status(403).json({ error: {code: res.statusCode, msg: "Permission Denied"}, data: null })
            }
            else {
                try {
                    const savedUser = await newUser.save()
                    res.status(200).json({ error: {code: null, msg: null}, data: "User Registered" });
                } catch (err) {
                    res.status(500).json({ error: {code: res.statusCode, msg: err}, data: null });
                }

            }
        }
        else if (loggedin_user.user_role == 2) {
            res.status(403).json({ error: {code: res.statusCode, msg: "Permission Denied"}, data: null })
        }
    },

    getAllUsers: async (req, res) => {
        const user = await User.findOne({ _id: req.user.id });
        if (user.user_role == 0) {
            if (!req?.query?.id) {
                const all_users = await User.find();
                res.status(200).json({ error: {code: null, msg: null}, data: all_users });
            }
            else {
                const selected_user = await User.findById({ _id: req.query.id });
                res.status(200).json({ error: {code: null, msg: null}, data: selected_user })
            }
        }
        else if (user.user_role == 1) {
            if (!req?.query?.id) {
                const all_users = await User.find({ user_role: { $eq: 2 } })
                res.status(200).json({ error: {code: null, msg: null}, data: all_users });
            }
            else {
                const selected_user = await User.findById({ _id: req.query.id });
                if (selected_user.user_role !== 2) {
                    res.status(403).json({ error: {code: res.statusCode, msg: "Permission Denied"}, data: null })
                }
                else {
                    res.status(200).json({ error: {code: null, msg: err}, data: selected_users });
                }
            }
        }
        else if (user.user_role == 2) {
            if (req.query.id) {
                res.status(403).json({ error: {code: res.statusCode, msg: "Permission Denied"}, data: null })
            }
            else {
                const { user_role, is_active, token, createdAt, updatedAt, __v, ...others } = user._doc;
                res.status(200).json({ error: {code: null, msg: null}, data: others });
            }
        }
        else {
            res.status(403).json({ error: {code: res.statusCode, msg: "Permission Denied"}, data: null })
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
                res.status(200).json({ error: {code: null, msg: null}, data: updated_user });
            } catch (err) {
                res.status(500).json({ error: {code: res.statusCode, msg: err}, data: null });
            }
        }
        else if (loggedin_user.user_role == 1) {
            const selected_user = await User.findById(req.params.id);
            if (selected_user.user_role !== 2) {
                if (req.params.id == loggedin_user.id) {
                    if (req.body.email || req.body.is_active || req.body.user_role) {
                        res.status(403).json({ error: {code: res.statusCode, msg: "Permission Denied"}, data: null })
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
                            res.status(200).json({ error: {code: null, msg: null}, data: updatedUsers });
                        } catch (err) {
                            res.status(500).json({ error: {code: res.statusCode, msg: err}, data: null });
                        }
                    }
                }
                else {
                    res.status(403).json({ error: {code: res.statusCode, msg: "Permission Denied"}, data: null })
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
                    res.status(200).json({ error: {code: null, msg: null}, data: updatedUsers });
                } catch (err) {
                    res.status(500).json({ error: {code: res.statusCode, msg: err}, data: null });
                }

            }
        }
        else if (loggedin_user.user_role == 2) {
            if (req.params.id == loggedin_user.id) {
                if (req.body.email || req.body.is_active || req.body.user_role) {
                    res.status(403).json({ error: {code: res.statusCode, msg: "Permission Denied"}, data: null })
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
                        res.status(200).json({ error: {code: null, msg: null}, data: updatedUser });
                    } catch (err) {
                        res.status(500).json({ error: {code: res.statusCode, msg: err}, data: null });
                    }
                }
            }
            else {
                res.status(403).json({ error: {code: res.statusCode, msg: "Permission Denied"}, data: null })
            }

        }
        else {
            res.status(403).json({ error: {code: res.statusCode, msg: "Permission Denied"}, data: null }) 
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
            return res.status(500).json({ error: { code: res.statusCode, msg: er }, data: null })
        }
    },

    testPython: async (req, res) => {
        try {
            const childPython = spawn('python', ['./script.py', 'node.js', 'python']);

            childPython.stdout.on('data', (data) => {
                console.log(`The new random number is: ${data}`)
                return res.status(200).json({ error: { code: null, msg: null }, data: `The new random number is: ${data}` })

            });

            childPython.stderr.on('data', (data) => {
                console.error(`There was an error: ${data}`);
                return res.status(200).json({ error: { code: null, msg: null }, data: data })
            });

            childPython.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
            });



        } catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: res.statusMessage }, data: null })
        }
    }
}



const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
}

const createRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' })
}

module.exports = userController
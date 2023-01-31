const fileFilterMiddleware = (err, req, res, next) => {

    if (err) {
        return res.status(413).json({ error: { code: res.statusCode, msg: err.message }, data: null })
    } else {
        next()
    } cb(null, false)
}

module.exports = fileFilterMiddleware
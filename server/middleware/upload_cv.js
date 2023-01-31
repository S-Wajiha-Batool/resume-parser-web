const path = require('path')
const multer = require('multer')

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploaded_CVs/')
    },
    filename: function(req, file, cb){
        let ext = path.extname(file.originalname)
        cb(null, Date.now() + ext)
    }
})

var upload = multer({
    storage: storage,
    fileFilter: function(req, file, callback){
        if(
            file.mimetype == 'application/doc' ||
            file.mimetype == 'application/docx' ||
            file.mimetype == 'application/pdf'
        ){
            callback(null, true)
        }else{
            console.log("Only doc, docx and pdf files are supported!")
            //return res.status(404).json({ error: { code: res.statusCode, msg:`File ${file.originalname} is in the wrong format` }, data: null })
            callback(null, false)
        }
    },
    limits: {
        fileSize: 1024 * 1024
    }
})

module.exports = upload
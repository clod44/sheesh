
const multer = require('multer');
const db = require("./db");

// Middleware function to check if the user is authenticated
const isAuthenticated = async (req, res, next) => {
    // Retrieve the session token from the request cookie
    const sessionToken = req.cookies.session;
    if (sessionToken == undefined) {
        req.allowRequest = false
    } else {
        // Check if the username exists in the database
        const cursor = db.usersCollection.find({ sessionToken: sessionToken });
        const foundUsers = await cursor.toArray();

        //just allow the request if the user exists
        req.allowRequest = (foundUsers.length > 0);
    }
    clog("access authorization : ", req.allowRequest, " : ", req.cookies.session, " : ", req.ip)

    if (!req.allowRequest) {
        res.json({ success: false })
        return
    }
    next();
};



const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/pfp/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});


const uploadMulter = multer({ storage: multerStorage })



module.exports = {
    isAuthenticated,
    uploadMulter,

};





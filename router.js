

const express = require('express');
const router = express.Router();

const middlewares = require("./middlewares.js")

const pageController = require("./controllers/pageController");
const apiController = require("./controllers/apiController.js");


router.get("/", pageController.getHomePage);
//router.get("/login", pageController.getLoginPage);
router.get("/profile", authenticate, pageController.getProfilePage);
router.post('/api/upload', authenticate, upload.single('pfp'), apiController.uploadFile);
router.get('/api/users', authenticate, apiController.getAllUsers);
router.post('/api/login', apiController.loginUser);
router.post('/api/logout', authenticate, apiController.logoutUser);

module.exports = {
    router
}






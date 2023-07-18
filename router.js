






const homeController = require("./controllers/homeController")
const loginController = require("./controllers/loginController")
const profileController = require("./controllers/profileController")



app.get("/", homeController.getHomePage);
app.get("/login", loginController.getLoginPage);
app.get("/profile", profileController.getProfilePage);















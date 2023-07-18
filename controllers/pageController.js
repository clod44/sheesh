function getLoginPage(req, res) {
    res.render('login');
}

function getHomePage(req, res) {
    res.render('index');
}

function getProfilePage(req, res) {
    res.render('profile');
}

module.exports = {
    getProfilePage,
    getHomePage,
    getLoginPage
};
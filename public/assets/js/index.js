document.addEventListener("DOMContentLoaded", function () {


    const btnNavbarGlobal = document.getElementById("btn-navbar-global")
    function loopFunction() {
        updateOnlineCount(btnNavbarGlobal)
        setTimeout(loopFunction, 5000);
    }
    loopFunction()



});

























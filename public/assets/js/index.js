document.addEventListener("DOMContentLoaded", function () {

    async function updateOnlineCount() {
        try {
            const response = await fetch("/api/onlineCount");
            const data = await response.json();
            clog("online count:",data.onlineCount)
            const btnNavbarGlobal = document.getElementById("btn-navbar-global")
            btnNavbarGlobal.textContent = `Global (${data.onlineCount})`
        } catch (error) {
            clog("Error:", error)
        }
    }
    updateOnlineCount()



});

























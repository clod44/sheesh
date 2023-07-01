

document.addEventListener("DOMContentLoaded", function () {
    updateSessionToken()

    //fetch user data to display
    async function updateProfile() {
        try {
            const response = await fetch('/api/profile');
            const data = await response.json();
            clog(data);
        } catch (error) {
            clog(error);
            console.error(error)
        }
    }

    updateProfile();





});




document.addEventListener("DOMContentLoaded", function () {

    
    const btnNavbarGlobal = document.getElementById("btn-navbar-global")
    function loopFunction() {
        updateOnlineCount(btnNavbarGlobal)
        setTimeout(loopFunction, 5000);
    }
    loopFunction()


    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the form from submitting normally
        const username = loginForm.elements.username.value;
        const password = loginForm.elements.password.value;

        const loginData = {
            username: username,
            password: password
        };
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();
            clog(data.message); // Response from the server
            window.location.href = "/profile"; // Redirect to the login page
        } catch (error) {
            clog('Error:', error);
        }
    });



});


















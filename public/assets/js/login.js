



document.addEventListener("DOMContentLoaded", function () {

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
        } catch (error) {
            clog('Error:', error);
        }
    });



});


















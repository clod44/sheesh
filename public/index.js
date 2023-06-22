document.addEventListener("DOMContentLoaded", function () {

    const socket = io();

    let currentUser = {
        username: "guest",
        password: "guest",
        authenticated: false,
        message: "you are a guest user"
    };


    const messagesContainer = document.getElementById("all-messages");
    const sendMessageButton = document.getElementById("send-message");
    const loginForm = document.getElementById("loginForm");

    // Add event listener to the form's submit event
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent form submission

        // Get the input field values


        // Get the form element
        var loginForm = document.getElementById("loginForm");

        // Create a new FormData object and append the form data
        var formData = new FormData(loginForm);
        var username = formData.get("username");
        var password = formData.get("password");

        if (username && password) {

            const userData = {
                username: username,
                password: password
            };
            socket.emit("login", userData);
        }

        // Close the modal
        var loginModal = document.getElementById("loginModal");
        var bootstrapModal = bootstrap.Modal.getInstance(loginModal);
        bootstrapModal.hide();
    });



    sendMessageButton.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent form submission

        // Get the message input field
        let messageInput = document.getElementById("message");
        let message = messageInput.value.trim();

        if (message) {
            let data = {
                username: currentUser.username,
                message: message,
                time: new Date().getTime()
            }
            socket.emit("chatMessage", data);
            messageInput.value = "";
            messageInput.focus();
        }
    });




    function displayMessage(messageData) {
        const { username, message, time } = messageData;

        let messageBubble;
        if (messageData.username && messageData.username == currentUser.username) {
            messageBubble = document.getElementById("example-message").cloneNode(true);
        } else {
            messageBubble = document.getElementById("example-reply").cloneNode(true);
        }
        messageBubble.removeAttribute("id"); // Remove the ID to avoid duplicate IDs in the DOM

        const usernameElement = messageBubble.querySelector("._example-username");
        usernameElement.innerText = username;
        const messageText = messageBubble.querySelector("._example-content");
        messageText.innerText = message;
        const timestamp = messageBubble.querySelector("._example-time");
        timestamp.innerText = formatTime(time);

        messagesContainer.appendChild(messageBubble);
        messageBubble.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    }

    function formatTime(time) {
        const date = new Date(time);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const formattedTime = hours + ':' + minutes;

        return formattedTime;
    }

    function showInfoModal(text, title="Sheesh") {
        const infoModal = document.getElementById('infoModal');
        const modalTitle = infoModal.querySelector('.modal-title');
        const modalText = infoModal.querySelector('.modal-text');
        modalTitle.textContent = title;
        modalText.textContent = text;
        // Show the info modal
        const modal = new bootstrap.Modal(infoModal);
        modal.show();
    }
    showInfoModal("you are connected to the chat");

    function displayUsers(users) {
        users.forEach(user => {
            // show all users
        });
    }

    function updateUserProfile(){
        const profileUsername = document.getElementById("profileUsername");
        const profilePassword = document.getElementById("profilePassword");
        profileUsername.value = currentUser.username;
        profilePassword.value = currentUser.password;
    }
    updateUserProfile();

    ///////////////////////////////////////////////////////////   PROFILE
    // Declare profilePictureInput globally
    const profilePictureInput = document.getElementById('profilePictureInput');

    // Listen for file input changes
    profilePictureInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            // Use FileReader to read the selected image file
            const reader = new FileReader();
            reader.onload = (e) => {
                const profilePicturePreview = document.getElementById('profilePicturePreview');
                profilePicturePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Add click event listener to the profile picture element
    const profilePicture = document.getElementById('profilePicturePreview');
    profilePicture.addEventListener('click', selectProfilePicture);
    //file picker trigger
    function selectProfilePicture() {
        profilePictureInput.click();
    }

    // Event handler for toggle button click
    function handleToggleButtonClick(event) {
        if (event.target.classList.contains('togglePasswordBtn')) {
            const inputGroup = event.target.closest('.input-group');
            const passwordInput = inputGroup.querySelector('input[type="password"]');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            event.target.innerHTML = type === 'password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';

            // Remove the event listener
            event.target.removeEventListener('click', handleToggleButtonClick);
        }
    }

    // Attach the event listener to all toggle buttons
    const toggleButtons = document.querySelectorAll('.togglePasswordBtn');
    toggleButtons.forEach((button) => {
        button.addEventListener('click', handleToggleButtonClick);
    });


    /*
    fetch('/users')
        .then(response => response.json())
        .then(users => {
            // Handle the response containing the users data
            console.log(users);
            displayUsers(users);
            // Perform any further processing or rendering of the users data
        })
        .catch(error => {
            // Handle any errors that occurred during the request
            console.log('Error:', error);
        });
    */

    // WebSocket message event
    socket.on('onlineCount', (data) => {
        const count = data.count;
        console.log("Online count:", count);
        document.getElementById("navbar-global").textContent = `Global (${count})`;
    });

    //handle incoming chat messages
    socket.on('chatMessage', (messageData) => {
        console.log(messageData);
        displayMessage(messageData);
    });

    //receive "response" from "joinChat"
    socket.on("loadPreviousMessages", (allMessages) => {
        console.log("fetched");
        // Display the previously sent messages in the chat interface
        allMessages.forEach((messageData) => {
            displayMessage(messageData);
        });
    });

    //fetch previous messages with this
    socket.emit("joinChat");

    socket.on("disconnect", () => {
        showInfoModal("you have been disconnected from the chat");
    });

    socket.on("userAuthentication", (response) => {
        currentUser = response;
        updateUserProfile();
        showInfoModal(currentUser.message);
    })



});

























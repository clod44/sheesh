
const socket = io();

let currentUser = {
    username: "guest",
    password: "guest"
};


const textboxMessage = document.getElementById("message");
const messagesContainer = document.getElementById("all-messages");
const sendMessageButton = document.getElementById("send-message");
const loginForm = document.getElementById("loginForm");

// Add event listener to the form's submit event
loginForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    // Get the input field values
    var usernameInput = document.getElementById("username");
    var passwordInput = document.getElementById("password");
    var username = usernameInput.value;
    var password = passwordInput.value;

    if (username && password) {

        const userData = {
            username: username,
            password: password
        };
        socket.emit("createUser", userData);
        currentUser = userData;
    }

    // Reset the input field values
    usernameInput.value = "";
    passwordInput.value = "";

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

    // Clone the example-reply element
    let messageBubble;
    if (messageData.username && messageData.username == currentUser.username) {

        messageBubble = document.getElementById("example-message").cloneNode(true);
    } else {

        messageBubble = document.getElementById("example-reply").cloneNode(true);
    }
    messageBubble.removeAttribute("id"); // Remove the ID to avoid duplicate IDs in the DOM

    // Update the username
    const usernameElement = messageBubble.querySelector("._example-username");
    usernameElement.innerText = username;

    // Update the message text
    const messageText = messageBubble.querySelector("._example-content");
    messageText.innerText = message;

    // Update the timestamp
    const timestamp = messageBubble.querySelector("._example-time");
    timestamp.innerText = formatTime(time); // Assuming you have a formatTime() function to format the time

    // Prepend the message bubble to the messages container
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



function displayInfo(info) {
    const messageElement = document.createElement("div");
    messageElement.innerText = info;
    messagesContainer.appendChild(messageElement);
}

//initial message
displayInfo("you are connected to the chat");

function displayUsers(users) {
    users.forEach(user => {
        const messageElement = document.createElement("div");
        messageElement.innerText = user.username;
        divAllUsers.appendChild(messageElement);
    });
}




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
    const count  = data.count;
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
    displayInfo("you have been disconnected from the chat");
});






























const socket = io();



//get dom elements
const userForm = document.getElementById("userForm");
const userFormUsername = document.getElementById("userFormUsername");
const userFormPassword = document.getElementById("userFormPassword");
const divAllUsers = document.getElementById("allUsers");

const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const messagesContainer = document.getElementById("messages");


userForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = userFormUsername.value.trim();
    const password = userFormPassword.value.trim();
    if (username && password) {

        const userData = {
            username: username,
            password: password
        };
        socket.emit("createUser", userData);
        //userFormUsername.value = "";
        //userFormPassword.value = "";
    }
});



//handle form submission
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = userFormUsername.value; //temp
    const message = messageInput.value.trim();
    if (message) {
        socket.emit("chatMessage", { username, message });
        messageInput.value = "";
        messageInput.focus();
    }
});




//display new messages
function displayMessage(messageData) {
    const messageElement = document.createElement("div");
    const { username, message } = messageData;
    messageElement.innerText = username + " : " + message;
    messagesContainer.prepend(messageElement);
}

function displayInfo(info) {
    const messageElement = document.createElement("div");
    messageElement.innerText = info;
    messagesContainer.prepend(messageElement);
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




const btnLoadPreviousMessages = document.getElementById("btn-loadPreviousMessages");
btnLoadPreviousMessages.addEventListener("click", () => {
    console.log("fetching...");
    socket.emit("joinChat");
});


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





























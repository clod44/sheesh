const config = require('config')
const db = require("./db")

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const socketController = require('./socketController');
socketController.handleSocketEvents(io, messagesCollection);

const PORT = config.PORT;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'ejs'));

app.use(express.static("public"));
app.use('/pfp', express.static(path.join(__dirname, 'uploads/pfp')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const router = require("./router.js")
app.use(router);


server.listen(PORT, () => {
    clog(`Server running on port ${PORT}`);

});






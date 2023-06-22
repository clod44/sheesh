require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { MongoClient } = require('mongodb');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});



let onlineCount = 0;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Connect to MongoDB
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then((client) => {
            console.log("Connected to MongoDB");
            const db = client.db("main-database");
            const usersCollection = db.collection('users');
            const messagesCollection = db.collection('messages');

            //get all users
            app.get("/users", async (req, res) => {
                const cursor = usersCollection.find({});
                const allUsers = await cursor.toArray();
                res.json(allUsers);
            });


            // Socket event handlers
            io.on('connection', (socket) => {
                onlineCount++;
                socket.emit("onlineCount", { count: onlineCount });

                console.log(`A user connected.(${onlineCount})`);

                socket.on("joinChat", async () => {
                    console.log("joining chat...");
                    const cursor = messagesCollection.find({});
                    const allMessages = await cursor.toArray();
                    socket.emit("loadPreviousMessages", allMessages);
                });

                // LOGIN & REGISTER
                socket.on("login", async (userData) => {
                    const { username, password } = userData;
                    console.log(`Login attempt:
                    username: ${username}
                    password: ${password}`);
                    // Check if the username exists in the database

                    const cursor = usersCollection.find({ username: username });
                    const foundUsers = await cursor.toArray();
                    if (foundUsers.length < 1) {
                        //such user doesnt exists
                        const newUser = {
                            username: username,
                            password: password,
                            authentication: true,
                            message: "new user has been created"
                        };
                        usersCollection.insertOne(newUser);
                        socket.emit("userAuthentication", newUser);
                    } else {
                        const user = foundUsers[0];
                        // Username exists, check the password
                        if (user.password === password) {
                            // Password matches, user authenticated
                            const response = {
                                username: user.username,
                                password: user.password,
                                authentication: true,
                                message: "Successfully logged in"
                            };
                            socket.emit("userAuthentication", response);
                        } else {
                            //incorrect password
                            const response = {
                                username: "guest",
                                password: "guest",
                                authentication: false,
                                message: "Incorrect password"
                            };
                            socket.emit("userAuthentication", response);
                        }
                    }
                });





                socket.on("chatMessage", (newMessageData) => {
                    console.log(`Received message from ${newMessageData.username}: ${newMessageData.message}`);
                    //save the message to database
                    messagesCollection.insertOne(newMessageData);
                    //realtime distribute to users
                    io.emit("chatMessage", newMessageData);
                });

                socket.on('disconnect', () => {
                    onlineCount--;
                    console.log(`A user has disconnected.(${onlineCount})`);
                });
            });

        })
        .catch((error) => {
            console.log('Error connecting to MongoDB:', error);
        });
});

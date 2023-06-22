require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { MongoClient } = require('mongodb');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});



let onlineCount = 0;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Connect to MongoDB
    MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then((client) => {
            console.log("Connected to MongoDB");
            const db = client.db();
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
                socket.send(JSON.stringify({ type: 'onlineCount', count: onlineCount }));

                console.log(`A user connected.(${onlineCount})`);

                socket.on("joinChat", async () => {
                    console.log("joining chat...");
                    const cursor = messagesCollection.find({});
                    const allMessages = await cursor.toArray();
                    socket.emit("loadPreviousMessages", allMessages);
                });

                // NEW USER
                socket.on("createUser", (userData) => {
                    const { username, password } = userData;
                    console.log(`new user!
                    username: ${username}
                    password: ${password}`);

                    usersCollection.insertOne({ username, password }, (error, result) => {
                        if (error) {
                            // Handle the insertion failure
                            console.log("user creation failed:" + error);
                            // socket.emit('userCreated', { success: false, message: 'Failed to save user information' });
                        } else {
                            // Handle the insertion success
                            console.log("user creation successful");
                            // socket.emit('userCreated', { success: true });
                        }
                    });
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

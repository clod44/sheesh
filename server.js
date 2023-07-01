require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

//set static directory
app.use(express.static("public"));
// Add middleware to parse JSON data in the request body
app.use(express.json());
// Add middleware to parse URL-encoded data in the request body
app.use(express.urlencoded({ extended: true }));
//be able to access cookies
app.use(cookieParser());

app.get("/", (req, res) => {
    const filePath = path.join(__dirname, "public", "index.html");
    res.sendFile(__dirname + "/index.html");
});
app.get("/login", (req, res) => {
    const filePath = path.join(__dirname, "public", "login.html");
    res.sendFile(filePath);
});

app.get("/api/onlineCount", (req, res) => {
    res.send({
        onlineCount: onlineCount,
        date: Date.now()
    });
});

let onlineCount = 0;
server.listen(PORT, () => {
    clog(`Server running on port ${PORT}`);

    // Connect to MongoDB
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then((client) => {
            clog("Connected to MongoDB");
            const db = client.db("main-database");
            const usersCollection = db.collection('users');
            const messagesCollection = db.collection('messages');

            // Middleware function to check if the user is authenticated
            const authenticate = async (req, res, next) => {
                // Retrieve the session token from the request cookie
                const sessionToken = req.cookies.session;

                // Check if the username exists in the database
                const cursor = usersCollection.find({ sessionToken: sessionToken });
                const foundUsers = await cursor.toArray();
                if (foundUsers.length < 1) {
                    // If the session token is valid, allow access to the route
                    next();
                    clog("request accepted")
                } else {
                    // If the session token is invalid or missing, redirect to login

                    const filePath = path.resolve(__dirname, 'public', 'login.html');
                    res.sendFile(filePath);

                    clog("unauthorized request was denied")
                }
            };

            /*
            // Protected route example
            app.get('/profile', authenticate, (req, res) => {
                // Accessible only for authenticated users
                res.send('Welcome to the profile page');
            });
            */

            app.get("/api/profile", authenticate, async (req, res) => {
                const cursor = usersCollection.find({ sessionToken: req.cookies.session });
                const foundUsers = await cursor.toArray();

                if (foundUsers.length < 1) {
                    return res.redirect("/login");
                }

                res.json(foundUsers[0]);
            });


            //get all users
            app.get("/api/users", authenticate, async (req, res) => {
                const cursor = usersCollection.find({});
                const allUsers = await cursor.toArray();
                res.json(allUsers);
            });




            app.post('/api/login', async (req, res) => {
                const { username, password } = req.body;

                const sessionToken = await loginAttempt(usersCollection, username, password)
                if (sessionToken == false) {
                    res.status(404).json({ message: 'failed authorization' });
                    return
                }

                // Set the session token as a cookie
                res.cookie('session', sessionToken, {
                    httpOnly: true, // Prevent client-side access
                    secure: true, // Only send the cookie over HTTPS
                    sameSite: 'strict', // Restrict cookie to the same origin
                    // Add additional options as needed
                });
                res.status(200).json({ message: 'Login successful' });
            });

            app.get('/api/logout', authenticate, async (req, res) => {
                clog("Logging out:", username, password);
                const sessionToken = req.cookies.session;

                //no need to check if sessionToken exists because we already authenticate in order to proceed
                //const cursor = usersCollection.find({ seesionToken }); ...

                //welp.. in order to update, we need to search for it anyways bruh
                await usersCollection.updateOne(
                    { sessionToken },
                    {
                        $set: { 'sessionToken': false },
                        $currentDate: { lastModified: true }
                    }
                );

                res.clearCookie('session');
                res.redirect('/login');
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





async function loginAttempt(usersCollection, username, password) {


    clog("Login attempt:", username, password);
    const sessionToken = uuidv4();

    // Check if the username exists in the database
    const cursor = usersCollection.find({ username: username });
    const foundUsers = await cursor.toArray();
    if (foundUsers.length < 1) {
        //such user doesnt exists
        const newUser = {
            username,
            password,
            sessionToken
        };
        usersCollection.insertOne(newUser);
        clog("new user has been registered: ", newUser)
        return sessionToken
    } else {
        const user = foundUsers[0];
        // Username exists, check the password
        if (user.password === password) {
            // Password matches, user authenticated
            await usersCollection.updateOne(
                { username },
                {
                    $set: { sessionToken },
                    $currentDate: { lastModified: true }
                }
            );
            clog("successfull login: ", username, sessionToken)
            return sessionToken
        } else {
            //incorrect password
            clog("failed login attempt")
            return false
        }
    }
}





function clog(...args) {
    const timestamp = formatDate(Date.now(), true);
    console.log(`[${timestamp}]`, ...args);
}

function formatDate(timestamp, includeDate = false) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    if (includeDate) {
        return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
    } else {
        return `${hours}:${minutes}:${seconds}`;
    }
}


const sharp = require('sharp');
const path = require('path');
const fs = require('fs');


async function profile(req, res) {

    const cursor = db.usersCollection.find({ sessionToken: req.cookies.session });
    const foundUsers = await cursor.toArray();

    if (foundUsers.length < 1) {
        return res.render("login");
    }

    res.json({ success: true, data: foundUsers[0] });
};



// Handle file upload
async function uploadFile(req, res) {
    try {
        const username = req.body.username;
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // CONVERT AND RENAME: username.jpeg
        const newFilename = `${username}.jpeg`;
        const newPath = path.join('./uploads/pfp/', newFilename);

        await sharp(req.file.path)
            .resize(128, 128)
            .toFormat('jpeg')
            .jpeg({ quality: 80 })
            .toFile(newPath);

        await db.collection('users').updateOne(
            { username: username },
            { $set: { profilePicture: `${newFilename}` } }
        );

        // Delete the original file
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error deleting the original file' });
            }
            res.status(200).json({ message: 'File uploaded and converted successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during file upload' });
    }
}

// Get all users
async function getAllUsers(req, res) {
    try {
        const cursor = db.usersCollection.find({});
        const allUsers = await cursor.toArray();
        res.json(allUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving users' });
    }
}

// User login
async function loginUser(req, res) {
    const { username, password } = req.body;

    const sessionToken = await loginAttempt(username, password);
    if (sessionToken == false) {
        res.status(404).json({ message: 'Failed authorization' });
        return;
    }

    // Set the session token as a cookie
    res.cookie('session', sessionToken, {
        httpOnly: true, // Prevent client-side access
        secure: true, // Only send the cookie over HTTPS
        sameSite: 'strict', // Restrict cookie to the same origin
        // Add additional options as needed
    });
    res.status(200).json({ message: 'Login successful' });
}



async function loginAttempt(username, password) {


    clog("Login attempt:", username, password);
    const sessionToken = uuidv4();

    // Check if the username exists in the database
    const cursor = db.usersCollection.find({ username: username });
    const foundUsers = await cursor.toArray();
    if (foundUsers.length < 1) {
        //such user doesnt exists
        const newUser = {
            username,
            password,
            sessionToken,
            profilePicture : false
        };
        db.usersCollection.insertOne(newUser);
        clog("new user has been registered: ", newUser)
        return sessionToken
    } else {
        const user = foundUsers[0];
        // Username exists, check the password
        if (user.password === password) {
            // Password matches, user authenticated
            await db.usersCollection.updateOne(
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




// User logout
async function logoutUser(req, res) {
    const sessionToken = req.cookies.session;

    // No need to check if sessionToken exists because we already authenticate in order to proceed
    // const cursor = usersCollection.find({ seesionToken }); ...
    // In order to update, we need to search for it anyways
    await usersCollection.updateOne(
        { sessionToken },
        {
            $set: { 'sessionToken': undefined },
            $currentDate: { lastModified: true },
        }
    );
    res.clearCookie('session');
    res.json({ success: true, data: 'Logout successful' });
}


async function getOnlineCount(req, res){
    res.send({
        onlineCount: onlineCount,
        date: Date.now()
    });
}

module.exports = {
    uploadFile,
    getAllUsers,
    loginUser,
    logoutUser,
    getOnlineCount,
    profile
};




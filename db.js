
const { MongoClient } = require('mongodb');
const config = require("./config")

let client = undefined;
let db = undefined;
let usersCollection = undefined;
let messagesCollection = undefined;

async function connectToMongoDB() {
    try {
        client = await MongoClient.connect(config.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        clog("Connected to MongoDB");
        
        db = client.db("main-database");
        usersCollection = db.collection('users');
        messagesCollection = db.collection('messages');

    } catch (error) {
        console.log('Error connecting to MongoDB:', error);
    }
}

connectToMongoDB();

module.exports = {
    client,
    db,
    usersCollection,
    messagesCollection
};




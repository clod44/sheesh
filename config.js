require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    MONGO_URL: process.env.MONGO_URL || ' - missing MONGO_URL in .env -',
    MONGO_DB: process.env.MONGO_DB || 'main',
    MONGO_USERS_COLLECTION: process.env.MONGO_USERS_COLLECTION || 'usersCollection',
};


const { clog } = require('../utils/utils');
const db = require("../db")
let onlineCount = 0;

function handleConnection(socket) {
    onlineCount++;
    socket.emit('onlineCount', { count: onlineCount });

    clog(`A user connected.(${onlineCount})`);

    socket.on('join-chat', handleJoinChat);
    socket.on('send-chat-message', handleSendChatMessage);
    socket.on('disconnect', handleDisconnect);



    async function handleJoinChat() {
        clog('Joining chat...');
        const cursor = messagesCollection.find({});
        const allMessages = await cursor.toArray();
        socket.emit('loadPreviousMessages', allMessages);
    }

    function handleSendChatMessage(newMessageData) {
        clog(`Received message from ${newMessageData.username}: ${newMessageData.message}`);
        // Save the message to the database
        messagesCollection.insertOne(newMessageData);
        // Real-time distribute to users
        io.emit('chatMessage', newMessageData);
    }

    function handleDisconnect() {
        onlineCount--;
        clog(`A user has disconnected.(${onlineCount})`);
    }
}

async function handleSocketEvents(io) {
    io.on('connection', handleConnection);
}

module.exports = {
    handleSocketEvents,
    onlineCount,
};

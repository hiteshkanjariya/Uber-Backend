const socketIo = require("socket.io");
const User = require("./models/user.model");
const Caption = require("./models/caption.modle");

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: "*",  // You can replace '*' with the URL of your frontend if needed
            methods: ["GET", "POST"],
        }
    });

    io.on('connection', (socket) => { // Fixed typo here: 'conection' -> 'connection'
        console.log(`Client connected: ${socket.id}`);

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });

        socket.on("join", async (data) => {
            const { userId, userType } = data;
            if (userType === "user") {
                await User.findByIdAndUpdate(userId, { socketId: socket.id })
            } else if (userType === "caption") {
                await Caption.findByIdAndUpdate(userId, { socketId: socket.id })
            }
        });

        socket.on('update-location-caption', async (data) => {
            const { userId, location } = data;
            if (!location || !location.lat || !location.lng) {
                return socket.emit("error", { message: "Invalid location" })
            }
            // coordinates: [70.0552102, 22.4732415] // [lng, lat]
            // coordinates: [location.lng, location.lat] // [lng, lat]
            const test = await Caption.findByIdAndUpdate(
                userId,
                {
                    $set: {
                        location: {
                            type: "Point",
                            coordinates: [location.lng, location.lat] // [lng, lat]
                        }
                    }
                },
                { new: true } // Return the updated document
            );
        });
        // You can also add event listeners here to receive specific events
        socket.on('chat message', (msg) => {
            console.log('Message received:', msg);
            // You can emit this message to other clients or perform other actions here
            io.emit('chat message', msg); // Broadcast message to all clients
        });
    });
}

// Function to send message to a specific socket
function sendMessageToSocketId(socketId, messageObj) {
    if (io) {
        io.to(socketId).emit(messageObj.event, messageObj.data); // Fix typo: soketId -> socketId
    } else {
        console.log("Socket.IO is not initialized");
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };

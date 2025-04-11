const dotenv = require('dotenv');
const express = require("express");
const connectDB = require('./db/db');
const cookies = require("cookie-parser")
const userRoutes = require("./routes/user.routes.js");
const captionRouter = require('./routes/caption.routes.js');
const http = require("http");
const { initializeSocket } = require("./socket.js")
dotenv.config();


connectDB();

const app = express();
const cors = require('cors');
const mapRoutes = require('./routes/map.routes.js');
const { authUser } = require('./middlewares/auth.middleware.js');
const rideRoutes = require('./routes/rode.routes.js');
const errorMiddleware = require('./middlewares/errorMiddleware.js');

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookies())
app.use("/user", userRoutes);
app.use("/caption", captionRouter)
app.use("/map", mapRoutes);
app.use("/ride", rideRoutes)
app.get("/", (req, res) => {
    res.send("Hello word")
});

app.use(errorMiddleware)
// Create an HTTP server and pass it to Socket.IO
const server = http.createServer(app);
// Initialize Socket.IO
initializeSocket(server);
const port = process.env.PORT || 300;
server.listen(port, () => {
    console.log(`Running on ${port}`)
})
// app.listen(port, () => {
// })
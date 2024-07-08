require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { setTimeout } = require("timers/promises");
const path = require("path");

const app = express();

//middlewares
app.use(cors());
app.use(express.static(path.resolve(__dirname, "dist")));

//api requests
app.get("/", (req, res) => {
  res.send("Hello world");
});
app.get("*", (req, res) => {
  res.send(path.resolve(__dirname, "dist", "index.html"));
});

//setting up http server to use socket io (because socket io dont run on express directly)
const server = http.createServer(app);

//Socket server creation that allow cors as well
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5137",
    methods: ["GET", "POST"],
  },
});
// code to listen client side events of socket.io
const CHAT_BOT = "ChatBot";
let chatRoom = ""; // E.g. javascript, node,...
let allUsers = []; // All users in current chat room
io.on("connection", (socket) => {
  console.log(socket.id);
  // Add a user to a room
  socket.on("join_room", (data) => {
    const { username, room } = data; // Data sent from client when join_room event emitted
    socket.join(room); // Join the user to a socket room

    // Send message to all users currently in the room, apart from the user that just joined
    let __createdtime__ = Date.now(); // Current timestamp
    socket.to(room).emit("receive_message", {
      message: `${username} has joined the chat room`,
      username: CHAT_BOT,
      __createdtime__,
    });

    // Send welcome msg to user that just joined chat only
    socket.emit("receive_message", {
      message: `Welcome ${username}`,
      username: CHAT_BOT,
      __createdtime__,
    });
    // Save the new user to the room
    chatRoom = room;
    allUsers.push({ id: socket.id, username, room });
    chatRoomUsers = allUsers.filter((user) => user.room === room);
    socket.to(room).emit("chatroom_users", chatRoomUsers);
    socket.emit("chatroom_users", chatRoomUsers);
  });
});

//server Connection
server.listen(process.env.PORT, () => {
  console.log("server running at", process.env.PORT);
});

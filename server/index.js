require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { setTimeout } = require("timers/promises");
const path = require("path");
const { saveMessage, get100Messages } = require("./controller/message");
const leaveRoom = require("./utils/leaveRoom");

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
    origin: "*",
    methods: ["GET", "POST"],
  },
  handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
      "Access-Control-Allow-Credentials": true,
    };
  },
});
// code to listen client side events of socket.io
const CHAT_BOT = "ChatBot";
let chatRoom = ""; // name of chat room for every user
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

    //to store new messages in database
    socket.on("send_message", (data) => {
      const { message, username, room, __createdtime__ } = data;
      io.in(room).emit("receive_message", data); // Send to all users in room, including sender
      saveMessage({ message, username, room, __createdtime__ }) // Save message in db
        .then((response) => console.log(response))
        .catch((err) => console.log(err));
    });

    //to get 100 messages from any room
    get100Messages(room)
      .then((last100Messages) => {
        // console.log('latest messages', last100Messages);
        socket.emit("last_100_messages", last100Messages);
      })
      .catch((err) => console.log(err));
  });

  //to eliminate user from room when he leaves
  socket.on("leave_room", (data) => {
    const { username, room } = data;
    socket.leave(room);
    // Remove user from memory
    const __createdtime__ = Date.now();
    allUsers = leaveRoom(socket.id, allUsers);
    socket.to(room).emit("chatroom_users", allUsers);
    socket.to(room).emit("receive_message", {
      username: CHAT_BOT,
      message: `${username} has left the chat`,
      __createdtime__,
    });
    console.log(`${username} has left the chat`);
  });

  // to disconnect user on internet issue
  socket.on("disconnect", () => {
    console.log("User disconnected from the chat");
    const user = allUsers.find((user) => user.id == socket.id);
    if (user?.username) {
      allUsers = leaveRoom(socket.id, allUsers);
      socket.to(chatRoom).emit("chatroom_users", allUsers);
      socket.to(chatRoom).emit("receive_message", {
        message: `${user.username} has disconnected from the chat.`,
      });
    }
  });
});

//database Connection
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGO_DATABASE);
  console.log("Database Connected");
}

//server Connection
server.listen(process.env.PORT, () => {
  console.log("server running at", process.env.PORT);
});

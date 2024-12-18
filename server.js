const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("./models/User");
const formatMessage = require("./utils/messages.js");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users.js");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const botName = "ChatBot";

dotenv.config();

// Serve static files
app.use(express.static(__dirname));

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => console.log("MongoDB Connected"));
mongoose.connection.on("error", (err) =>
  console.error("MongoDB Connection Error:", err)
);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a chat room
  socket.on("joinRoom", async ({ username, room }) => {
    console.log(socket.id, username, room);
    const user = await userJoin(socket.id, username, room);
    console.log("not here",user)

    if (user) {
      socket.join(user.room);

      socket.emit("message", formatMessage(botName, "Welcome to the chat"));

      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          formatMessage(botName, `${user.username} has joined the chat`)
        );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: await getRoomUsers(user.room),
      });
    }
  });

  // Handle chat messages
  socket.on("chatMessage", async (msg) => {
    const user = await getCurrentUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", formatMessage(user.username, msg));
    }
  });

  // Handle disconnect event
  socket.on("disconnect", async () => {
    const user = await userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: await getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

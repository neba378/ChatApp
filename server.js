const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const formatMessage = require('./utils/messages.js')
const {userJoin, getCurrentUser,users} = require('./utils/users.js')

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const botName = "ChatBot"


app.use(express.static(path.join(__dirname, "public")));

io.on('connection', socket =>{

  socket.on('joinRoom', ({username, room})=>{
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    socket.emit("message", formatMessage(botName, "Welcome to the chat"));

    socket.broadcast.to(user.room).emit(
    "message",
    formatMessage(botName, `${user.username} has joined the chat`)
  );
  socket.on("chatMessage", (msg)=>{
  io.to(user.room).emit("message", formatMessage(`${user.username}`, msg));
})
  socket.on("disconnect", () => {
    io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat`));
  });
  })
  
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



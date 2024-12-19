// const { userJoin, getCurrentUser, users } = require("../../utils/users.js");

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.querySelector(".room-name");
const userList = document.getElementById("users");
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

console.log('username: ',username)
const socket = io("chatapp-production-499e.up.railway.app", {
  transports: ["websocket", "polling"], // Ensure compatibility with various transports
});

// join chat room

socket.emit("joinRoom", { username, room });

socket.on("message", (text) => {
  outputMessage(text);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Chat send handle
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;
  socket.emit("chatMessage", msg);
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// username send handle

function outputMessage(obj) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta"> ${obj.username} <span> ${obj.time}</span> </p>
  <p class="text"> ${obj.text}</p>`;
  document.querySelector(".chat-messages").append(div);
}

function outputRoomName(room) {
  roomName.innerHTML = room;
}

function outputUsers(users) {
  userList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join("")}
  `;
}

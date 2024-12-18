const User = require("./../models/User");

async function userJoin(id, username, room) {
  const user = new User({ id, username, room });
  try {
    await user.save();
    return user;
  } catch (error) {
    console.error("Error adding user to MongoDB:", error.message);
    return null;
  }
}

// Get current user by ID
async function getCurrentUser(id) {
  return await User.findOne({ id });
}

// Remove user from the chat
async function userLeave(id) {
  return await User.findOneAndDelete({ id });
}

// Get users in a room
async function getRoomUsers(room) {
  return await User.find({ room });
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
};
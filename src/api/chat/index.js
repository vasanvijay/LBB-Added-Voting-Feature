const getAllChat = require("./get-all-chat");
const sendMessage = require("./send-message");
const getRoom = require("./get-room");
const initiateChat = require("./initiate-chat");
const getMessages = require("./get-messages");
const history = require("./get-history");
const lastMessage = require("./get-last-message");
const starMesssage = require("./update-message");

module.exports = exports = {
  getAllChat,
  sendMessage,
  getRoom,
  initiateChat,
  getMessages,
  history,
  lastMessage,
  starMesssage,
};

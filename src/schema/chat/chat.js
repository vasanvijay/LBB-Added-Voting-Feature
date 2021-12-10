const mongoose = require("mongoose");
module.exports = (connection) => {
  const chatSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "chat_room" },
    sender: { type: mongoose.Schema.Types.ObjectId, refPath: "user" },
    message: { type: String },
    messageType: { type: String },
    type: { type: String },
    attach: { type: String },
    readBy: { type: Array },
    isActive: { type: Boolean, default: true },
    isStar: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() },
    parentMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat",
      default: null,
    },
  });

  // return chat Schema;
  return connection.model("chat", chatSchema, "chat");
};

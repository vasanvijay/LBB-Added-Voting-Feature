const mongoose = require("mongoose");
module.exports = (connection) => {
  const chatRoomSchema = new mongoose.Schema({
    participateIds: [{ type: mongoose.Schema.Types.ObjectId }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() },
  });

  // return chat Schema;
  return connection.model("chat_room", chatRoomSchema, "chat_room");
};

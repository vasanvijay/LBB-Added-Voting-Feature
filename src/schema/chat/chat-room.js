const mongoose = require("mongoose");
module.exports = (connection) => {
  const chatRoomSchema = new mongoose.Schema({
    participateIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  });

  // return chat Schema;
  return connection.model("chat_room", chatRoomSchema, "chat_room");
};

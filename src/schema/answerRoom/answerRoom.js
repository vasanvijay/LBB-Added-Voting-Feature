const mongoose = require("mongoose");
module.exports = (connection) => {
  const answerRoomSchema = new mongoose.Schema({
    participateIds: [{ type: mongoose.Schema.Types.ObjectId }],
    questionId: { type: mongoose.Schema.Types.ObjectId },
    createdAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    lastMessage: {
      createdAt: { type: Date },
      answerId: { type: mongoose.Schema.Types.ObjectId },
      answer: String,
    },
    isActive: { type: Boolean, default: true },
  });

  return connection.model("answer_room", answerRoomSchema, "answer_room");
};

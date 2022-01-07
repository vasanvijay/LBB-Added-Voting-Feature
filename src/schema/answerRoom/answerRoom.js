const mongoose = require("mongoose");
module.exports = (connection) => {
  const answerSchema = new mongoose.Schema({
    answerId: { type: mongoose.Schema.Types.ObjectId },
    answer: String,
    answerBy: { type: mongoose.Schema.Types.ObjectId },
    answerAt: { type: Date },
    updatedAt: { type: Date },
    messageStar: { type: Boolean, default: false },
    isAbuse: { type: Boolean, default: false },
    updated: { type: Boolean, default: false },
  });

  const answerRoomSchema = new mongoose.Schema({
    participateIds: [{ type: mongoose.Schema.Types.ObjectId }],
    questionId: { type: mongoose.Schema.Types.ObjectId },
    answer: [answerSchema],
    createdAt: { type: Date },
  });

  return connection.model("answer_room", answerRoomSchema, "answer_room");
};

const mongoose = require("mongoose");
module.exports = (connection) => {
  const answerSchema = new mongoose.Schema({
    answer: String,
    answerBy: { type: mongoose.Schema.Types.ObjectId },
    answerAt: { type: Date, default: Date.now() },
  });

  const answerRoomSchema = new mongoose.Schema({
    participateIds: [{ type: mongoose.Schema.Types.ObjectId }],
    questionId: { type: mongoose.Schema.Types.ObjectId },
    answer: [answerSchema],
    createdAt: { type: Date, default: Date.now() },
  });

  // return chat Schema;
  return connection.model("answer_room", answerRoomSchema, "answer_room");
};

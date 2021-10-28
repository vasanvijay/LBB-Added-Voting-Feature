const mongoose = require("mongoose");
module.exports = (connection) => {
  const answerSchema = new mongoose.Schema({
    answer: String,
    answerBy: { type: mongoose.Schema.Types.ObjectId },
    question: { type: mongoose.Schema.Types.ObjectId },
    answerAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
    updated: { type: Boolean, default: false },
  });
  return connection.model("answer", answerSchema, "answer");
};

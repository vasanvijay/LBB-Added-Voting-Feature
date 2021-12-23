const mongoose = require("mongoose");
module.exports = (connection) => {
  const answerSchema = new mongoose.Schema({
    answer: String,
    answerBy: { type: mongoose.Schema.Types.ObjectId },
    question: { type: mongoose.Schema.Types.ObjectId },
    answerAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
    updated: { type: Boolean, default: false },
    isAbuse: { type: Boolean, default: false },
  });
  return connection.model("answer", answerSchema, "answer");
};

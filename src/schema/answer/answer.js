const mongoose = require("mongoose");
module.exports = (connection) => {
  const answerSchema = new mongoose.Schema({
    answer: String,
    answerBy: { type: mongoose.Schema.Types.ObjectId },
    question: { type: mongoose.Schema.Types.ObjectId },
    answerAt: { type: Date },
    updatedAt: { type: Date },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
    isUpdated: { type: Boolean, default: false },
    isAbuse: { type: Boolean, default: false },
  });
  return connection.model("answer", answerSchema, "answer");
};

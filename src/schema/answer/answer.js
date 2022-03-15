const mongoose = require("mongoose");
module.exports = (connection) => {
  const answerSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId },
    answer: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    question: { type: mongoose.Schema.Types.ObjectId },
    isUpdated: { type: Boolean, default: false },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
    isUpdated: { type: Boolean, default: false },
    isAbuse: { type: Boolean, default: false },
    isStar: { type: Boolean, default: false },
    status: { type: Number, default: 0 },
    user_type: { type: String, default: "user" },
  });
  return connection.model("answer", answerSchema, "answer");
};

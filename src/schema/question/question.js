const mongoose = require("mongoose");
module.exports = (connection) => {
  const questionSchema = new mongoose.Schema({
    question: String,
    createdAt: { type: Date, default: Date.now },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    filter: [
      {
        filterId: mongoose.Schema.Types.ObjectId,
        filterName: String,
        options: [
          {
            optionId: mongoose.Schema.Types.ObjectId,
            optionName: String,
            status: String,
          },
        ],
      },
    ],
    displayProfile: { type: Boolean, default: false },
    allowConnectionRequest: { type: Boolean, default: false },
    view: { type: Number, default: 0 },
    response: { type: Number, default: 0 },
    status: { type: String, default: "active" },
  });
  return connection.model("question", questionSchema, "question");
};

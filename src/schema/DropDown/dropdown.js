const mongoose = require("mongoose");
module.exports = (connection) => {
  const questiondrop = new mongoose.Schema({
    createdAt: { type: Date },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    updatedAt: { type: Date },
    dropdown: { type: String },
    type: { type: String },
    status: { type: String, default: "active" },
  });
  return connection.model("dropdown", questiondrop, "dropdown");
};

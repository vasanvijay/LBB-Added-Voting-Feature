const mongoose = require("mongoose");
module.exports = (connection) => {
  const connectionSchema = new mongoose.Schema({
    message: String,
    senderId: { type: mongoose.Schema.Types.ObjectId },
    receiverId: { type: mongoose.Schema.Types.ObjectId },
    requestedAt: { type: Date, default: new Date() },
    status: { type: String },
  });
  return connection.model("connection", connectionSchema, "connection");
};

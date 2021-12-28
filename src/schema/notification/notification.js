const mongoose = require("mongoose");
module.exports = (connection) => {
  const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    receiverId: { type: mongoose.Schema.Types.ObjectId },
    title: String,
    description: String,
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now() },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedAt: { type: Date, default: Date.now() },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
    question: { type: mongoose.Schema.Types.ObjectId },
  });
  return connection.model("notification", notificationSchema, "notification");
};

const mongoose = require("mongoose");
module.exports = (connection) => {
  const matchingSchema = new mongoose.Schema({
    matchingBy: { type: mongoose.Schema.Types.ObjectId },
    matchingTo: { type: mongoose.Schema.Types.ObjectId },
    status: String,
    matchingAt: { type: Date, default: Date.now() },
    acceptedAt: { type: Date, default: Date.now() },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
  });
  return connection.model("matching", matchingSchema, "matching");
};

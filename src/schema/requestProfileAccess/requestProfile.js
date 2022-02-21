const mongoose = require("mongoose");
module.exports = (connection) => {
  const requestProfileSchema = new mongoose.Schema({
    requestBy: { type: mongoose.Schema.Types.ObjectId, refPath: "user" },
    requestTo: { type: mongoose.Schema.Types.ObjectId, refPath: "user" },
    createdAt: { type: Date },
    updatedAt: { type: Date, default: Date.now() },
    status: { type: String, default: "pending" },
    acceptedAT: { type: Date },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, refPath: "user" },
    roomId: { type: mongoose.Schema.Types.ObjectId },
    typeOfRequest: { type: String, default: "requestProfileAccess" },
  });
  // return chat Schema;
  return connection.model(
    "requestProfile",
    requestProfileSchema,
    "requestProfile"
  );
};

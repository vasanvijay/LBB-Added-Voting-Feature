const mongoose = require("mongoose");
module.exports = (connection) => {
  const requestProfileSchema = new mongoose.Schema({
    requestBy: { type: mongoose.Schema.Types.ObjectId, refPath: "user" },
    requestTo: { type: mongoose.Schema.Types.ObjectId, refPath: "user" },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() },
  });
  // return chat Schema;
  return connection.model(
    "requestProfile",
    requestProfileSchema,
    "requestProfile"
  );
};

const mongoose = require("mongoose");
module.exports = (connection) => {
  const legendsSchema = new mongoose.Schema({
    legendsIcon: String,
    legendsName: String,
    legendsDescription: String,
    createdAt: { type: Date, default: new Date() },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedAt: { type: Date, default: new Date() },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
  });
  return connection.model("legends", legendsSchema, "legends");
};

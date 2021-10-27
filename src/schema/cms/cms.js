const mongoose = require("mongoose");
module.exports = (connection) => {
  const cmsSchema = new mongoose.Schema({
    title: String,
    description: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  return connection.model("cms", cmsSchema, "cms");
};

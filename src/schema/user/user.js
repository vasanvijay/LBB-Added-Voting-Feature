const mongoose = require("mongoose");
module.exports = (connection) => {
  const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: String,
    verified : { type: Boolean, default: false },
    userType: { type: String, default: "user" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: {
      type: String,
      default: "Admin",
    },
    updatedBy: {
      type: String,
      default: "Admin",
    },
    lastLogin: { type: Date, default: Date.now },
    token: { type: String, default: null },
    status: { type: Boolean, default: true }
  });
  return connection.model("user", userSchema, "user");
};

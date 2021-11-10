const mongoose = require("mongoose");
module.exports = (connection) => {
  const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    verified: { type: Boolean, default: false },
    formFilled: { type: Boolean, default: false },
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
    answerLater: [{ type: mongoose.Schema.Types.ObjectId }],
    accepted: [{ type: mongoose.Schema.Types.ObjectId }],
    lastLogin: { type: Date, default: Date.now },
    token: { type: String, default: null },
    status: { type: Boolean, default: true },
    organizationName: { type: String, default: null },
    currentRole: { type: String, default: null },
    region: { type: String, default: null },
    organizationEmail: { type: String, default: null },
    linkedinProfile: { type: String, default: null },
    organizationWebsite: { type: String, default: null },
    otherLink: { type: String, default: null },
    howDidFind: { type: String, default: null },
    subject: { type: Array, default: null },
  });
  return connection.model("user", userSchema, "user");
};

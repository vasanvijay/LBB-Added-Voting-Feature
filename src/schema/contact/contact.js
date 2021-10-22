const mongoose = require("mongoose");
module.exports = (connection) => {
  const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message:String,
    status: { type: Boolean, default: true },
    reply: { type: Boolean, default: false },
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
     
  });
  return connection.model("contact", userSchema, "contact");
};

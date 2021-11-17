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
    removeQuestion: [{ type: mongoose.Schema.Types.ObjectId }],
    blockUser: [{ type: mongoose.Schema.Types.ObjectId }],
    accepted: [{ type: mongoose.Schema.Types.ObjectId }],
    lastLogin: { type: Date, default: Date.now },
    token: { type: String, default: null },
    status: { type: Boolean, default: true },
    message: { type: String, default: null },
    text: { type: String, default: null },
    organizationName: { type: String, default: null },
    currentRole: { type: String, default: null },
    region: { type: String, default: null },
    organizationEmail: { type: String, default: null },
    linkedinProfile: { type: String, default: null },
    organizationWebsite: { type: String, default: null },
    otherLink: { type: String, default: null },
    howDidFind: { type: String, default: null },
    subject: { type: Array, default: null },
    regionShow: { type: Boolean, default: true },
    currentRoleShow: { type: Boolean, default: true },
    DOB: { type: String, default: null },
    DOBShow: { type: Boolean, default: true },
    countryOfOrigin: { type: Array, default: null },
    countryOfOriginShow: { type: Boolean, default: true },
    gender: { type: String, default: null },
    gendereShow: { type: Boolean, default: true },
    countryOfResidence: { type: String, default: null },
    countryOfResidenceShow: { type: Boolean, default: true },
    industry: { type: String, default: null },
    industryShow: { type: Boolean, default: true },
    employeeNumber: { type: String, default: null },
    employeeNumberShow: { type: Boolean, default: true },
    ethnicity: { type: Array, default: null },
    ethnicityShow: { type: Boolean, default: true },
    politicalAffiliation: { type: String, default: null },
    politicalAffiliationShow: { type: Boolean, default: true },
    religiousAffiliation: { type: String, default: null },
    religiousAffiliationShow: { type: Boolean, default: true },
    levelOfEducation: { type: String, default: null },
    levelOfEducationShow: { type: Boolean, default: true },
    sexualOrientation: { type: String, default: null },
    sexualOrientationShow: { type: Boolean, default: true },
    notificationSound: { type: Boolean, default: true },
    messageSound: { type: Boolean, default: true },
  });
  return connection.model("user", userSchema, "user");
};

const userRegistration = require("./registration");
const userLogin = require("./login");
const getUser = require("./get-user");
const verifyCode = require("./verify-code");
const verifyEmail = require("./verify-email");
const updateUSer = require("./update-user");
const updateStatus = require("./update-status");
const getAllUser = require("./get-all-user");

module.exports = exports = {
  userRegistration,
  userLogin,
  getUser,
  verifyCode,
  verifyEmail,
  updateUSer,
  updateStatus,
  getAllUser,
};

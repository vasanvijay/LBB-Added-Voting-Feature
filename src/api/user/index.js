const userRegistration = require("./registration");
const userLogin = require("./login");
const getUser = require("./get-user");
const verifyCode = require("./verify-code");
const verifyEmail = require("./verify-email");
const updateUSer = require("./update-user");
const updateStatus = require("./update-status");
const getAllUser = require("./get-all-user");
const searchUser = require("./search-user");
const userData = require("./user-data");
const resetPassword = require("./reset-password");
const deactivateAccount = require("./deactivate-account");

module.exports = exports = {
  userRegistration,
  userLogin,
  getUser,
  verifyCode,
  verifyEmail,
  updateUSer,
  updateStatus,
  getAllUser,
  searchUser,
  userData,
  resetPassword,
  deactivateAccount,
};

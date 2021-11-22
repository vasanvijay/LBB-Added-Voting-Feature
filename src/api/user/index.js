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
const blockUser = require("./block-user");
const unBlockUser = require("./unblock-user");
const getBlockuser = require("./get-block-user");
const topUser = require("./top-user");
const updatePassword = require("./update-password");
const forgetPassword = require("./forget-password");
const getCount = require("./get-count");

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
  blockUser,
  unBlockUser,
  getBlockuser,
  topUser,
  updatePassword,
  forgetPassword,
  getCount,
};

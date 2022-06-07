const userRegistration = require("./registration");
const userLogin = require("./login");
const getUser = require("./get-user");
const verifyCode = require("./verify-code");
const verifyEmail = require("./verify-email");
const sendEmail = require("./send-mail");
const updateUSer = require("./update-user");
const updateStatus = require("./update-status");
const getAllUser = require("./get-all-user");
const getUsers = require("./get-users");
const searchUser = require("./search-user");
const userData = require("./user-data");
const resetPassword = require("./reset-password");
const deactivateAccount = require("./deactivate-account");
const blockUser = require("./block-user");
const unBlockUser = require("./unblock-user");
const getBlockuser = require("./get-block-user");
const getBlockstatus = require("./get-block-status");
const topUser = require("./top-user");
const updatePassword = require("./update-password");
const forgetPassword = require("./forget-password");
const getCount = require("./get-count");
const sendMailForWrokEmail = require("./sent-mail-work-email");
const agoraToken = require("./agora-token");
const verifyWorkEmail = require("./verify-work-email");
const updateOnlineStatus = require("./update-online-status");
const formsubmit = require("./Form-submit");
const submiteduser = require("./submited-user");

module.exports = exports = {
  userRegistration,
  userLogin,
  getUser,
  verifyCode,
  verifyEmail,
  sendEmail,
  updateUSer,
  updateStatus,
  getAllUser,
  getUsers,
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
  verifyWorkEmail,
  agoraToken,
  sendMailForWrokEmail,
  getBlockstatus,
  updateOnlineStatus,
  formsubmit,
  submiteduser,
};

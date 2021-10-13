const userRegistration = require("./registration");
const userLogin = require("./login");
const getUser = require("./get-user");
const verifyCode = require("./verify-code");
const verifyEmail = require("./verify-email");

module.exports = exports = {
  userRegistration,
  userLogin,
  getUser,
  verifyCode,
  verifyEmail,
};

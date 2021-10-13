const express = require("express");
const router = express.Router();
const api4User = require("../../api/user/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Method
router.get(
  "/",
  passport.authenticate(["jwt"], { session: false }),
  api4User.getUser.handler
);

// Post Methods
router.post(
  "/registration",
  validate("body", api4User.userRegistration.validation),
  api4User.userRegistration.handler
);
router.post(
  "/login",
  validate("body", api4User.userLogin.validation),
  api4User.userLogin.handler
);

// Put Method
router.put(
  "/verify-email",
  validate("body", api4User.verifyEmail.validation),
  api4User.verifyEmail.handler
);
router.put(
  "/verify-code",
  validate("body", api4User.verifyCode.validation),
  api4User.verifyCode.handler
);

module.exports = exports = router;

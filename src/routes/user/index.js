const express = require("express");
const router = express.Router();
const api4User = require("../../api/user/index");
const updateStatus = require("../../api/user/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Method
router.get(
  "/",
  passport.authenticate(["jwt"], { session: false }),
  api4User.getUser.handler
);
router.get(
  "/all-user",
  passport.authenticate(["jwt"], { session: false }),
  api4User.getAllUser.handler
);
router.get(
  "/blockList",
  passport.authenticate(["jwt"], { session: false }),
  api4User.getBlockuser.handler
);
router.get(
  "/search=:searchData",
  passport.authenticate(["jwt"], { session: false }),
  api4User.searchUser.handler
);
router.get(
  "/topUser",
  passport.authenticate(["jwt"], { session: false }),
  api4User.topUser.handler
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
router.post(
  "/reset",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4User.resetPassword.validation),
  api4User.resetPassword.handler
);
router.post(
  "/de-activate",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4User.deactivateAccount.validation),
  api4User.deactivateAccount.handler
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
router.put(
  "/verification-form",
  validate("body", api4User.userData.validation),
  api4User.userData.handler
);
router.put(
  "/",
  passport.authenticate(["jwt"], { session: false }),
  api4User.updateUSer.handler
);
router.put(
  "/update-status/id=:userId&status=:status",
  passport.authenticate(["jwt"], { session: false }),
  api4User.updateStatus.handler
);
router.put(
  "/block/id=:userId",
  passport.authenticate(["jwt"], { session: false }),
  api4User.blockUser.handler
);
router.put(
  "/unblock/id=:userId",
  passport.authenticate(["jwt"], { session: false }),
  api4User.unBlockUser.handler
);
module.exports = exports = router;

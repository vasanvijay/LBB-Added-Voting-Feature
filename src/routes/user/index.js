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
  "/submited-user",
  // passport.authenticate(["jwt"], { session: false }),
  api4User.submiteduser.handler
);
// get all users chose type is only user
router.get(
  "/all-users",
  passport.authenticate(["jwt"], { session: false }),
  api4User.getUsers.handler
);
router.get(
  "/blockList",
  passport.authenticate(["jwt"], { session: false }),
  api4User.getBlockuser.handler
);
router.get(
  "/topUser",
  passport.authenticate(["jwt"], { session: false }),
  api4User.topUser.handler
);
router.get(
  "/count",
  passport.authenticate(["jwt"], { session: false }),
  api4User.getCount.handler
);
router.get(
  "/agora",
  // passport.authenticate(["jwt"], { session: false }),
  api4User.agoraToken.handler
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
router.post(
  "/search/",
  passport.authenticate(["jwt"], { session: false }),
  api4User.searchUser.handler
);
router.post(
  "/reset/id=:userId",
  validate("body", api4User.updatePassword.validation),
  api4User.updatePassword.handler
);

// Put Method
router.put(
  "/verify-email",
  validate("body", api4User.verifyEmail.validation),
  api4User.verifyEmail.handler
);

// get send mail

router.post(
  "/send-mail",
  // validate("body", api4User.verifyEmail.validation),
  api4User.sendEmail.handler
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
  "/form-submit/id=:userId&status=:status",
  // passport.authenticate(["jwt"], { session: false }),
  api4User.formsubmit.handler
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
router.put(
  "/forget",
  validate("body", api4User.forgetPassword.validation),
  api4User.forgetPassword.handler
);
router.put(
  "/work-email",
  validate("body", api4User.sendMailForWrokEmail.validation),
  passport.authenticate(["jwt"], { session: false }),
  api4User.sendMailForWrokEmail.handler
);
router.put("/work-email/verify/id=:id", api4User.verifyWorkEmail.handler);

module.exports = exports = router;

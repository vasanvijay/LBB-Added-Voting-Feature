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
  "/:searchData",
  passport.authenticate(["jwt"], { session: false }),
  api4User.searchUser.handler
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
router.put(
  "/verification-form",
  validate("body", api4User.userData.validation),
  api4User.userData.handler
);
router.put(
  "/id=:userId",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4User.updateUSer.validation),
  api4User.updateUSer.handler
);

router.put(
  "/update-status/id=:userId&status=:status",
  passport.authenticate(["jwt"], { session: false }),
  api4User.updateStatus.handler
);

module.exports = exports = router;

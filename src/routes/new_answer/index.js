const express = require("express");
const router = express.Router();
const api4NewAnswer = require("../../api/new_answer/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Post Methods
router.post(
  "/init",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4NewAnswer.initAnsweRoom.validation),
  api4NewAnswer.initAnsweRoom.handler
);

module.exports = exports = router;

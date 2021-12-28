const express = require("express");
const router = express.Router();
const api4Matching = require("../../api/matching/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Methods
router.get(
  "/user",
  passport.authenticate(["jwt"], { session: false }),
  api4Matching.getSameUser.handler
);

module.exports = exports = router;

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

// POST Methods
router.post(
  "/accept/id=:id",
  passport.authenticate(["jwt"], { session: false }),
  api4Matching.sendMatchReq.handler
);

router.post(
  "/reject/id=:id",
  passport.authenticate(["jwt"], { session: false }),
  api4Matching.rejectMatching.handler
);

module.exports = exports = router;

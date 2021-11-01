const express = require("express");
const router = express.Router();
const chatApi = require("../../api/chat");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Methods
router.get(
  "/get-all-chat",
  passport.authenticate(["jwt"], { session: false }),
  chatApi.getAllChat.handler
);
router.get(
  "/get-messages",
  passport.authenticate(["jwt"], { session: false }),
  validate("query", chatApi.getMessages.validation),
  chatApi.getMessages.handler
);

// Post Methods
router.post(
  "/send-message",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", chatApi.sendMessage.validation),
  chatApi.sendMessage.handler
);
router.post(
  "/initiate-chat",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", chatApi.initiateChat.validation),
  chatApi.initiateChat.handler
);

// Put Methods

module.exports = exports = router;
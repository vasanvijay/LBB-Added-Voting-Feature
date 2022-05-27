const express = require("express");
const router = express.Router();
const api4Answer = require("../../api/answer/index.js");
const { validate } = require("../../middlewares");
const passport = require("passport");

// GET Method
router.get(
  "/",
  passport.authenticate(["jwt"], { session: false }),
  api4Answer.getAnswer.handler
);

router.get(
  "/get-abuse-question",
  passport.authenticate(["jwt"], { session: false }),
  api4Answer.getAbuseQuestion.handler
);

router.get(
  "/later",
  passport.authenticate(["jwt"], { session: false }),
  api4Answer.getAnswerLater.handler
);
router.get(
  "/:question",
  passport.authenticate(["jwt"], { session: false }),
  api4Answer.getAnswerByQuestion.handler
);
router.get(
  "/seeAnswer/id=:question",
  passport.authenticate(["jwt"], { session: false }),
  api4Answer.answerByUser.handler
);
router.get(
  "/answer-room/id=:room",
  passport.authenticate(["jwt"], { session: false }),
  api4Answer.answerRoomById.handler
);
// PUT Method
router.put(
  "/id=:answerId",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4Answer.updateAnswer.validation),
  api4Answer.updateAnswer.handler
);
router.put(
  "/:questionId",
  passport.authenticate(["jwt"], { session: false }),
  api4Answer.removeAnswerLater.handler
);
router.put(
  "/star/id=:roomId",
  passport.authenticate(["jwt"], { session: false }),
  api4Answer.starAnswer.handler
);
router.put(
  "/remove/id=:roomId",
  passport.authenticate(["jwt"], { session: false }),
  api4Answer.removeRoomAnswer.handler
);
router.put(
  "/abuse/id=:answerId",
  passport.authenticate(["jwt"], { session: false }),
  api4Answer.abuseAnswer.handler
);
router.put(
  "/report/id=:answerId",
  passport.authenticate(["jwt"], { session: false }),
  api4Answer.acceptAbuse.handler
);
router.put(
  "/decline/id=:answerId",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4Answer.declineAbuse.validation),
  api4Answer.declineAbuse.handler
);

// POST Method
router.post(
  "/question=:question",
  passport.authenticate(["jwt"], { session: false }),
  api4Answer.addAnswer.handler
);
router.post(
  "/id=:questionId",
  passport.authenticate(["jwt"], { session: false }),
  api4Answer.answerLater.handler
);
router.post(
  "/asked/id=:questionId",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4Answer.addAnswerInAsked.validation),
  api4Answer.addAnswerInAsked.handler
);

// DELETE Method
router.delete(
  "/id=:answerId",
  passport.authenticate(["jwt"], { session: false }),
  api4Answer.deleteAnswer.handler
);
router.delete(
  "/:answerId",
  passport.authenticate(["jwt"], { session: false }),
  api4Answer.removeAnswer.handler
);
module.exports = exports = router;

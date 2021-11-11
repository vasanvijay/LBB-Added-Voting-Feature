const express = require("express");
const router = express.Router();
const api4Question = require("../../api/question/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

// GET Method
router.get(
  "/get-question",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.getQuestion.handler
);

// POST Method
router.post(
  "/create-question",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.createQuestion.handler
);

// PUT Method
router.put(
  "/update-question",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.updateQuestion.handler
);
router.put(
  "/id=:questionId",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4Question.questionUpdate.validation),
  api4Question.questionUpdate.handler
);

// DELETE METHOD
router.delete(
  "/:questionId",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.deletedQuestion.handler
);
module.exports = exports = router;

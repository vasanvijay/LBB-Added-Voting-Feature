const addAnswer = require("./add-answer");
const getAnswer = require("./get-answer");
const updateAnswer = require("./update-answer");
const deleteAnswer = require("./delete-answer");
const answerLater = require("./add-answer-later");
const getAnswerLater = require("./get-answer-later");
const removeAnswerLater = require("./remove-answer-later");
const getAnswerByQuestion = require("./get-answer-by-question");
const removeAnswer = require("./remove-answer");
const answerByUser = require("./answer-by-user");
const answerRoomById = require("./get-answer-room-by-id");
const addAnswerInAsked = require("./add-answer-in-asked-question");

module.exports = exports = {
  addAnswer,
  getAnswer,
  updateAnswer,
  deleteAnswer,
  answerLater,
  getAnswerLater,
  removeAnswerLater,
  getAnswerByQuestion,
  removeAnswer,
  answerByUser,
  answerRoomById,
  addAnswerInAsked,
};

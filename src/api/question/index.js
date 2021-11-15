const createQuestion = require("./create-question");
const getQuestion = require("./get-question");
const updateQuestion = require("./update-status-of-question");
const questionUpdate = require("./update-question");
const deletedQuestion = require("./delete-question");
const removeForUser = require("./remove-question-for-user");

module.exports = exports = {
  createQuestion,
  getQuestion,
  updateQuestion,
  questionUpdate,
  deletedQuestion,
  removeForUser,
};

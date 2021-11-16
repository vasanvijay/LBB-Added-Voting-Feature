const createQuestion = require("./create-question");
const getQuestion = require("./get-question");
const updateQuestion = require("./update-status-of-question");
const questionUpdate = require("./update-question");
const deletedQuestion = require("./delete-question");
const removeForUser = require("./remove-question-for-user");
const questionWithFilter = require("./get-question-with-filter");

module.exports = exports = {
  createQuestion,
  getQuestion,
  updateQuestion,
  questionUpdate,
  deletedQuestion,
  removeForUser,
  questionWithFilter,
};

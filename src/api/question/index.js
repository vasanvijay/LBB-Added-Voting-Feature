const createQuestion = require("./create-question");
const getQuestion = require("./get-question");
const updateQuestion = require("./update-status-of-question");
const questionUpdate = require("./update-question");
const deletedQuestion = require("./delete-question");
const removeForUser = require("./remove-question-for-user");
const questionWithFilter = require("./get-question-with-filter");
const reportQuestion = require("./report-abuse");
const getReportedQuestion = require("./get-reported-question");
const acceptAbuse = require("./accept-abuse-reason");
const declineRequest = require("./decline-abuse-request");
const searchQuestion = require("./get-search-api");
const getQuestionAdmin = require("./get-question-admin");
const acceptReportedQuestion = require("./accept-reported-question")

module.exports = exports = {
  createQuestion,
  getQuestion,
  updateQuestion,
  questionUpdate,
  deletedQuestion,
  removeForUser,
  questionWithFilter,
  reportQuestion,
  getReportedQuestion,
  acceptAbuse,
  declineRequest,
  searchQuestion,
  getQuestionAdmin,
  acceptReportedQuestion
};

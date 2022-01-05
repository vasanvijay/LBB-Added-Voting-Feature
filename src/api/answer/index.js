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
const starAnswer = require("./star-message");
const removeRoomAnswer = require("./delete-into-room");
const abuseAnswer = require("./abuse-answer");
const acceptAbuse = require("./accept-abuse-reason-answer");
const declineAbuse = require("./decline-abuse-request-answer");
const requestProfile = require("./request-profile-access");
const requestAccept = require("./accept-request");
const requestInSeeAnswer = require("./request-profile-in-see-answer");

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
  starAnswer,
  removeRoomAnswer,
  abuseAnswer,
  acceptAbuse,
  declineAbuse,
  requestProfile,
  requestAccept,
  requestInSeeAnswer,
};

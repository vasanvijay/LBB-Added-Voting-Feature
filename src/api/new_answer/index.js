const getAnswerByRoom = require("./get-answer-by-room");
const getAnswerRoom = require("./get-answer-room");
const getAnswerByRoomAdmin = require("./get-answer-room-admin");
const newAnswer = require("./new-answer");
const initAnsweRoom = require("./init-answer-chat");
const removeAnswer = require("./remove-answer");
const starAnswer = require("./star-answer");
const requestProfile = require("./request-profile-access");
const requestProfileInSeeAns = require("./request-profile-in-see-answer");
const acceptRequest = require("./accept-request");
const declineRequest = require("./decline-profile-access-request");
const getAnswerRequest = require("./get-request-by-room");
const getAnswerAdmin = require("./admin-get-answer");

module.exports = exports = {
  getAnswerByRoom,
  getAnswerRoom,
  newAnswer,
  initAnsweRoom,
  removeAnswer,
  starAnswer,
  requestProfile,
  requestProfileInSeeAns,
  acceptRequest,
  declineRequest,
  getAnswerRequest,
  getAnswerByRoomAdmin,
  getAnswerAdmin,
};

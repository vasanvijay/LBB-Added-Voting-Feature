const { ObjectId } = require("mongodb");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      let user = await utils.getHeaderFromToken(req.user);
      let { roomId } = req;
      let findRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
        _id: ObjectId(roomId),
      });
      if (findRoom) {
        let findAnswer = await global.models.GLOBAL.ANSWER.find({
          roomId: ObjectId(roomId),
        }).populate({
          path: "createdBy",
          model: "user",
          select:
            "_id name subject profileImage currentRole countryOfResidence",
        });

        if (!findAnswer.length < 0) {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.GENERAL,
            payload: {},
            logPayload: false,
          };
          return data4createResponseObject;
        } else {
          let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
            _id: findRoom.questionId,
          });
          if (findQuestion.createdBy == user.id) {
            let findRequest =
              await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne({
                $and: [
                  { requestBy: user.id },
                  { requestTo: findRoom.createdBy },
                ],
              }).populate({
                path: "requestBy",
                model: "user",
                select:
                  "_id name email region currentRole subject profileImage countryOfResidence",
              });
            let receivedRequest =
              await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne({
                $and: [
                  { requestBy: findRoom.createdBy },
                  { requestTo: user.id },
                ],
              }).populate({
                path: "requestTo",
                model: "user",
                select:
                  "_id name email region currentRole subject profileImage countryOfResidence",
              });
            console.log("FINDREQU-->", findRequest);
            console.log("receivedRequest-->", receivedRequest);
            if (findRequest) {
              if (findRequest.status === "accepted") {
                let text = "Your request has been accepted by this user.";

                const data4createResponseObject = {
                  req: req,
                  result: 0,
                  message: messages.ITEM_FETCHED,
                  payload: {
                    answer: findAnswer,
                    text: text,
                    request: findRequest,
                  },
                  logPayload: false,
                };
                return data4createResponseObject;
              } else if (findRequest.status === "decline") {
                let text = "Your request has been declined by this user.";

                const data4createResponseObject = {
                  req: req,
                  result: 0,
                  message: messages.ITEM_FETCHED,
                  payload: {
                    answer: findAnswer,
                    text: text,
                    request: findRequest,
                  },
                  logPayload: false,
                };
                return data4createResponseObject;
              } else {
                let text = "You have requested access to view profile.";

                const data4createResponseObject = {
                  req: req,
                  result: 0,
                  message: messages.ITEM_FETCHED,
                  payload: {
                    answer: findAnswer,
                    text: text,
                    request: findRequest,
                  },
                  logPayload: false,
                };
                return data4createResponseObject;
              }
            } else if (receivedRequest) {
              if (receivedRequest.status === "accepted") {
                let text =
                  "You have accepted the request to access to view your profile.";
                const data4createResponseObject = {
                  req: req,
                  result: 0,
                  message: messages.ITEM_FETCHED,
                  payload: {
                    answer: findAnswer,
                    text: text,
                    request: receivedRequest,
                  },
                  logPayload: false,
                };
                return data4createResponseObject;
              } else if (receivedRequest.status === "decline") {
                let text =
                  "You has declined the request to access to view your profile.";
                const data4createResponseObject = {
                  req: req,
                  result: 0,
                  message: messages.ITEM_FETCHED,
                  payload: {
                    answer: findAnswer,
                    text: text,
                    request: receivedRequest,
                  },
                  logPayload: false,
                };
                return data4createResponseObject;
              } else {
                let text =
                  "You have received request to access to view your profile.";
                const data4createResponseObject = {
                  req: req,
                  result: 0,
                  message: messages.ITEM_FETCHED,
                  payload: {
                    answer: findAnswer,
                    text: text,
                    request: receivedRequest,
                  },
                  logPayload: false,
                };
                return data4createResponseObject;
              }
            } else {
              const data4createResponseObject = {
                req: req,
                result: 0,
                message: messages.ITEM_FETCHED,
                payload: {
                  answer: findAnswer,
                },
                logPayload: false,
              };
              return data4createResponseObject;
            }
          } else {
            let findRequest =
              await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne({
                $and: [
                  { requestBy: user.id },
                  { requestTo: findQuestion.createdBy },
                ],
              }).populate({
                path: "requestBy",
                model: "user",
                select:
                  "_id name email region currentRole subject profileImage countryOfResidence",
              });
            let receivedRequest =
              await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne({
                $and: [
                  { requestBy: findQuestion.createdBy },
                  { requestTo: user.id },
                ],
              }).populate({
                path: "requestTo",
                model: "user",
                select:
                  "_id name email region currentRole subject profileImage countryOfResidence",
              });
            console.log("FINDREQU-->", findRequest);
            console.log("receivedRequest-->", receivedRequest);
            if (findRequest) {
              if (findRequest.status === "accepted") {
                let text = "Your request has been accepted by this user.";

                const data4createResponseObject = {
                  req: req,
                  result: 0,
                  message: messages.ITEM_FETCHED,
                  payload: {
                    answer: findAnswer,
                    text: text,
                    request: findRequest,
                  },
                  logPayload: false,
                };
                return data4createResponseObject;
              } else if (findRequest.status === "decline") {
                let text = "Your request has been declined by this user.";

                const data4createResponseObject = {
                  req: req,
                  result: 0,
                  message: messages.ITEM_FETCHED,
                  payload: {
                    answer: findAnswer,
                    text: text,
                    request: findRequest,
                  },
                  logPayload: false,
                };
                return data4createResponseObject;
              } else {
                let text = "You have requested access to view profile.";

                const data4createResponseObject = {
                  req: req,
                  result: 0,
                  message: messages.ITEM_FETCHED,
                  payload: {
                    answer: findAnswer,
                    text: text,
                    request: findRequest,
                  },
                  logPayload: false,
                };
                return data4createResponseObject;
              }
            } else if (receivedRequest) {
              if (receivedRequest.status === "accepted") {
                let text =
                  "You have accepted the request to access to view your profile.";
                const data4createResponseObject = {
                  req: req,
                  result: 0,
                  message: messages.ITEM_FETCHED,
                  payload: {
                    answer: findAnswer,
                    text: text,
                    request: receivedRequest,
                  },
                  logPayload: false,
                };
                return data4createResponseObject;
              } else if (receivedRequest.status === "decline") {
                let text =
                  "You has declined the request to access to view your profile.";
                const data4createResponseObject = {
                  req: req,
                  result: 0,
                  message: messages.ITEM_FETCHED,
                  payload: {
                    answer: findAnswer,
                    text: text,
                    request: receivedRequest,
                  },
                  logPayload: false,
                };
                return data4createResponseObject;
              } else {
                let text =
                  "You have received request to access to view your profile.";
                const data4createResponseObject = {
                  req: req,
                  result: 0,
                  message: messages.ITEM_FETCHED,
                  payload: {
                    answer: findAnswer,
                    text: text,
                    request: receivedRequest,
                  },
                  logPayload: false,
                };
                return data4createResponseObject;
              }
            } else {
              const data4createResponseObject = {
                req: req,
                result: 0,
                message: messages.ITEM_FETCHED,
                payload: {
                  answer: findAnswer,
                },
                logPayload: false,
              };
              return data4createResponseObject;
            }
          }
        }
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.ITEM_NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return data4createResponseObject;
      }
    } catch (error) {
      logger.error(
        `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
      );
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
    }
  },
};

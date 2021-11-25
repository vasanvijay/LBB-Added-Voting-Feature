const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      let { user } = req;
      let { roomId } = req.params;
      let { answerId } = req.body;
      let findAnswerRoom = await global.models.GLOBAL.ANSWER_ROOM.find({
        _id: roomId,
      });
      console.log("ANSWER ROOM--->", findAnswerRoom);
      if (findAnswerRoom) {
        let answerObj;
        findAnswerRoom.map((ansObj) => {
          //   console.log("ANS-->", ansObj.answer);
          answerObj = ansObj.answer.map((ansId) => {
            console.log("ANS ID--->>", ansId._id == answerId);
            if (ansId._id == answerId) {
              //   console.log("ID-->", answerId);
              return {
                answerAt: new Date(),
                _id: ansId._id,
                answer: req.body.answer ? req.body.answer : ansId.answer,
                messageStar: req.body.messageStar
                  ? req.body.messageStar
                  : ansId.messageStar,
                answerBy: ansId.answerBy,
              };
            } else {
              return {
                answerAt: ansId.answerAt,
                _id: ansId._id,
                answer: ansId.answer,
                messageStar: ansId.messageStar,
                answerBy: ansId.answerBy,
              };
            }
          });
        });
        console.log("answerObj-->", answerObj);
        let starAndUpdate =
          await global.models.GLOBAL.ANSWER_ROOM.findOneAndUpdate(
            { _id: roomId },
            {
              $set: {
                answer: answerObj,
              },
            },
            { new: true }
          );
        console.log("STAR--->>>", starAndUpdate);
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_UPDATED,
          payload: { starAndUpdate },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.ITEM_NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.NOT_FOUND)
          .json(utils.createResponseObject(data4createResponseObject));
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
      res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};

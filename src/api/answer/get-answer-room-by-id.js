const Joi = require("joi");
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
      let { room } = req.params;
      let findAnswerRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
        _id: room,
      })
        .populate({
          path: "answer.answerBy",
          model: "user",
          select: "_id name email region currentRole profileImage subject",
        })
        .populate({
          path: "questionId",
          model: "question",
          select: "_id question response view createdBy",
        });
      if (findAnswerRoom) {
        // let answerRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
        //   questionId: question,
        // });
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_FETCHED,
          payload: { findAnswerRoom },
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

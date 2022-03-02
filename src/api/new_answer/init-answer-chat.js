const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const ObjectId = require("mongodb").ObjectId;

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  //  route validation
  validation: Joi.object({
    questionId: Joi.string().required(),
  }),
  // route handler
  handler: async (req, res) => {
    try {
      const { questionId } = req.body;
      // console.log("this calleddddddd");

      const { user } = req;
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: questionId,
      });
      if (findQuestion) {
        let participateIds = [];
        // check user type
        participateIds.push(user._id);
        participateIds.push(questionId);
        participateIds.push(findQuestion.createdBy);

        let chatRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
          participateIds: {
            $size: participateIds.length,
            $all: [...participateIds],
          },
        });
        if (chatRoom) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.INITIATION_SUCCESS,
            payload: { chatRoom },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          let roomObj = {
            participateIds: participateIds,
            questionId: questionId,
            createdAt: Date.now(),
            createdBy: user._id,
          };
          chatRoom = await global.models.GLOBAL.ANSWER_ROOM.create(roomObj);
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.INITIATION_SUCCESS,
            payload: { chatRoom },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
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

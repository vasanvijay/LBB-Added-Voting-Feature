const { ObjectID, ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Remove Answer
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { answerId } = req.params;
    if (!answerId) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }
    try {
      const answerExists = await global.models.GLOBAL.ANSWER.findById(answerId);
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: answerExists.question,
      });
      if (findQuestion) {
        const id = findQuestion._id;
        const answerBy = user._id;
        const questionBy = findQuestion.createdBy;

        let participateIds = [];
        participateIds.push(answerBy);
        participateIds.push(id);
        participateIds.push(questionBy);

        let answerRoom =
          await global.models.GLOBAL.ANSWER_ROOM.findOneAndUpdate(
            {
              participateIds: {
                $size: participateIds.length,
                $all: [...participateIds],
              },
            },
            {
              $pull: {
                answer: { answerId: ObjectId(answerId) },
              },
            },
            { new: true }
          );
        const deleteAnswer = await global.models.GLOBAL.ANSWER.findOneAndRemove(
          {
            _id: answerId,
            answerBy: user._id,
          }
        );

        if (deleteAnswer) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_DELETED,
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.NOT_ALLOWED,
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "Sorry, Something went wrong to delete answer.",
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
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

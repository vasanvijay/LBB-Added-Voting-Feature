const { ObjectID } = require("mongodb");
const { serializeUser } = require("passport");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  handler: async (req, res) => {
    const { user } = req;
    const { answerId } = req.params;
    const answerExists = await global.models.GLOBAL.ANSWER.findById(answerId);
    // console.log("ANS-->", answerExists);
    if (!answerExists) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.NOT_FOUND,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    try {
      if (answerId) {
        let findQuestion = await global.models.GLOBAL.findOne({
          _id: answerExists.question,
        });
        if (findQuestion) {
          const deleteAnswer =
            await global.models.GLOBAL.ANSWER.findOneAndRemove({
              _id: answerId,
              createdBy: user._id,
            });

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

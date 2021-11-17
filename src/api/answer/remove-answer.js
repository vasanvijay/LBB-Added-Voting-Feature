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
        const deletedAnswer =
          await global.models.GLOBAL.ANSWER.findOneAndDelete({
            _id: answerId,
            answerBy: user._id,
          });

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

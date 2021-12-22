const Joi = require("joi");
const { ObjectID } = require("mongodb");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  validation: Joi.object({
    userId: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    const { answerId } = req.params;
    const { userId } = req.body;
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
      const updateAnswer = await global.models.GLOBAL.ANSWER.findByIdAndUpdate(
        { _id: answerId },
        {
          $set: {
            reportAbuse: true,
          },
        },
        { new: true }
      );

      const removeFromUser = await global.models.GLOBAL.USER.findByIdAndUpdate(
        { _id: userId },
        {
          $pull: {
            abuseAnswer: {
              answerId: ObjectID(answerId),
            },
          },
        },
        { new: true }
      );
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_UPDATED,
        payload: { updateAnswer },
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
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

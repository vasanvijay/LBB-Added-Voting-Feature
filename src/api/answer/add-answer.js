const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add Answer
module.exports = exports = {
  // route validation
  validation: Joi.object({
    answer: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { question } = req.params;
    const { answer } = req.body;
    if (!question || !answer) {
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
      let addAnswer = {
        answer: answer,
        answerBy: user._id,
        question: question,
        answerAt: Date.now(),
      };
      const newAnswer = await global.models.GLOBAL.ANSWER(addAnswer);
      newAnswer.save();
      await global.models.GLOBAL.QUESTION.updateOne(
        { _id: question },
        { $inc: { response: 1 } },
        { new: true }
      );
      await global.models.GLOBAL.USER.findOneAndUpdate(
        { _id: user._id },
        {
          $pull: {
            answerLater: question,
          },
        }
      );
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_INSERTED,
        payload: { newAnswer },
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

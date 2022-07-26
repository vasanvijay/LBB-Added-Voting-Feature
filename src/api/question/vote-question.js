const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route validation
  validation: Joi.object({
    question: Joi.string().allow(),
    displayProfile: Joi.boolean().allow(),
    allowConnectionRequest: Joi.boolean().allow(),
    filter: Joi.array().allow(),
  }),

  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { questionId, upVote, downVote } = req.params;
    rating = upVote - downVote;

    try {
      const currentUser = await global.models.GLOBAL.USER.findById({ _id: user._id });
      if (!currentUser.votedQuestions.includes(questionId)) {
        const saveVote = await global.models.GLOBAL.USER.findByIdAndUpdate(
          { _id: user._id },
          {
            $push: {
              votedQuestions: questionId,
            },
          }
        );
        const updateQuestion = await global.models.GLOBAL.QUESTION.findByIdAndUpdate(
          { _id: questionId },
          {
            $set: {
              downVote: downVote,
              upVote: upVote,
              rating: rating,
            },
          },
          { new: true }
        );
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.VOTE_SUCCESS,
          payload: { updateQuestion },
          logPayload: false,
        };
        res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: 1,
          message: messages.QUESTION_ALREADY_VOTED,
          payload: {},
          logPayload: false,
        };
        res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
      }
    } catch (error) {
      logger.error(`${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`);
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      res.status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(utils.createResponseObject(data4createResponseObject));
    }
  },
};

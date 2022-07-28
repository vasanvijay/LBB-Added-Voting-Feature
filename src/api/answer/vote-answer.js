const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { answerId, upVote, downVote } = req.params;
    // console.log(answerId);
    const { user } = req;
    let rating = upVote - downVote;

    try {
      const currentUser = await global.models.GLOBAL.USER.findById({ _id: user._id });
      if (!currentUser.votedAnswers.includes(answerId)) {
        const saveVote = await global.models.GLOBAL.USER.findByIdAndUpdate(
          { _id: user._id },
          {
            $push: {
              votedAnswers: answerId,
            },
          }
        );
        const updateAnswer = await global.models.GLOBAL.ANSWER.findByIdAndUpdate(
          { _id: answerId },
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
          payload: { updateAnswer },
          logPayload: false,
        };
        res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: 1,
          message: messages.ANSWER_ALREADY_VOTED,
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

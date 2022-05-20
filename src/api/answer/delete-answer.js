const { ObjectID, ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Remove Answer
module.exports = exports = {
  // route handler
  handler: async ({ answerId, userData }) => {
    let user = await utils.getHeaderFromToken(userData);

    if (!answerId) {
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      data4createResponseObject;
    }
    try {
      const answerExists = await global.models.GLOBAL.ANSWER.findOne({
        _id: answerId,
      });
      // // console.log("USER---->>", user._id);
      // // console.log("ANS---->>>", answerExists);
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: answerExists.question,
      });
      if (findQuestion) {
        const updatedQue = await global.models.GLOBAL.QUESTION.updateOne(
          { _id: answerExists.question, createdBy: { $nin: user.id } },
          { $inc: { response: -1 } },
          { new: true }
        );
        const deleteAnswer = await global.models.GLOBAL.ANSWER.findOneAndRemove(
          {
            _id: answerId,
          }
        );

        if (deleteAnswer) {
          const data4createResponseObject = {
            // req: req,
            result: 0,
            message: "Answer deleted successfully",
            payload: {},
            logPayload: false,
          };
          return data4createResponseObject;
        } else {
          const data4createResponseObject = {
            // req: req,
            result: -1,
            message: messages.NOT_ALLOWED,
            payload: {},
            logPayload: false,
          };
          return data4createResponseObject;
        }
      } else {
        const data4createResponseObject = {
          // req: req,
          result: -1,
          message: "Sorry, Something went wrong to delete answer.",
          payload: {},
          logPayload: false,
        };
        return data4createResponseObject;
      }
    } catch (error) {
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
    }
  },
};

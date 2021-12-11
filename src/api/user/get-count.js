const { ObjectID } = require("bson");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Block-user List from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    try {
      let questionAsked = await global.models.GLOBAL.QUESTION.count({
        createdBy: user._id,
      });

      let answerLaters = await global.models.GLOBAL.USER.findOne({
        _id: user._id,
      });
      let answerLaterCount = answerLaters.answerLater.length;

      let answer = 0;
      let questionArray = await global.models.GLOBAL.ANSWER.find().distinct(
        "question",
        { $and: [{ answerBy: user._id }] }
      );
      let abuseQuestion = [];
      for (var i = 0; i < user.abuseQuestion.length; i++) {
        abuseQuestion.push(user.abuseQuestion[i].questionId);
      }
      let cc = 0;
      answer = await questionArray.map(async (ques) => {
        let ans = await global.models.GLOBAL.QUESTION.findOne({
          $and: [
            { _id: ques },
            { _id: { $nin: user.answerLater } },
            { _id: { $nin: user.removeQuestion } },
            { _id: { $nin: abuseQuestion } },
            { createdBy: { $nin: user.blockUser } },
          ],
        });
        cc = cc + (ans != null ? ans.length : 0);
      });
      console.log("count----------", cc);
      // let getAnswer = await global.models.GLOBAL.ANSWER.find({
      //   answerBy: ObjectID(user._id),
      // });

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: {
          questionAskedCount: questionAsked,
          answerLaterCount: answerLaterCount,
          getAnswerCount: cc,
        },
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));

      //   const data4createResponseObject = {
      //     req: req,
      //     result: -1,
      //     message: messages.NOT_FOUND,
      //     payload: {},
      //     logPayload: false,
      //   };
      //   res
      //     .status(enums.HTTP_CODES.NOT_FOUND)
      //     .json(utils.createResponseObject(data4createResponseObject));
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

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
        status: "active",
      });

      let answerLaters = await global.models.GLOBAL.USER.findOne({
        _id: user._id,
      });

      let answerLaterCount = answerLaters.answerLater.length;

      let answer = 0;
      let questionArray = await global.models.GLOBAL.ANSWER.find().distinct(
        "question",
        { $and: [{ createdBy: user._id }] }
      );

      let abuseQuestion = [];
      for (var i = 0; i < user.abuseQuestion.length; i++) {
        abuseQuestion.push(user.abuseQuestion[i].questionId);
      }
      let cc = 0;

      let ans = await global.models.GLOBAL.QUESTION.count({
        _id: { $in: questionArray },
        $and: [
          { _id: { $nin: user.answerLater } },
          { _id: { $nin: user.removeQuestion } },
          { _id: { $nin: abuseQuestion } },
          { createdBy: { $nin: [...user.blockUser, user._id] } },
          { status: { $in: "active" } },

          // { createdBy: { $nin: user.blockUser, $nin: user._id } },
        ],
      });

      console.log("ANSWER-LATER-COUNT", ans);
      // // console.log("ANS-->>", ans);
      cc = cc + ans;
      // // console.log("CC--->>", cc);
      user.subject.push(user.currentRole);
      user.subject.push(user.region);
      user.subject.push(user.gender);
      user.subject.push(user.countryOfResidence);
      user.subject.push(user.industry);
      user.subject.push(user.employeeNumber);
      user.subject.push(user.politicalAffiliation);
      user.subject.push(user.religiousAffiliation);
      user.subject.push(user.levelOfEducation);
      user.subject.push(user.sexualOrientation);

      user.subject = [...user.subject, ...user.ethnicity];
      user.subject = [...user.subject, ...user.countryOfOrigin];
      let allQuestion = await global.models.GLOBAL.QUESTION.count({
        $and: [
          { _id: { $nin: user.answerLater } },
          { _id: { $nin: user.removeQuestion } },
          { _id: { $nin: questionArray } },
          { _id: { $nin: abuseQuestion } },
          { createdBy: { $nin: user.blockUser } },
        ],
        $or: [
          { "filter.options.optionName": { $exists: false } },
          { "filter.options.optionName": { $in: user.subject } },
        ],
        createdBy: { $nin: user.blockUser },
        createdBy: { $nin: user._id },
        status: { $in: "active" },
        reportAbuse: false,
      });

      console.log("allQuestion--->", allQuestion);
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: {
          questionAskedCount: questionAsked,
          answerLaterCount: answerLaterCount,
          getAnswerCount: cc,
          questionReceivedCount: allQuestion,
        },
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    } catch (error) {
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

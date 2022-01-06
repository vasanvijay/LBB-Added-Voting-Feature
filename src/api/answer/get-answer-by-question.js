const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { question } = req.params;
    if (!question) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }
    try {
      const { user } = req;
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      let abuseAnswer = [];
      for (let i = 0; i < user.abuseAnswer.length; i++) {
        abuseAnswer.push(user.abuseAnswer[i].answerId);
      }
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: question,
      });
      // console.log("findQue-->>", findQuestion);
      let answer = await global.models.GLOBAL.ANSWER.find({
        $and: [
          { isAbuse: false },
          { question: question },
          { _id: { $nin: abuseAnswer } },
          { answerBy: { $eq: user._id } },
          { answerBy: { $eq: findQuestion.createdBy } },
        ],
      })
        .populate({
          path: "question",
          model: "question",
          select: "_id question response filter view displayProfile createdAt",
        })
        .populate({
          path: "answerBy",
          model: "user",
          select: "_id name email region currentRole subject profileImage",
        })
        .skip(skip)
        .limit(limit)
        .sort({
          createdAt: -1,
        });
      let findRequest =
        await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne(
          { requestBy: user._id },
          { requestTo: findQuestion.createdBy }
        ).populate({
          path: "requestBy",
          model: "user",
          select: "_id name email region currentRole subject profileImage",
        });
      let receivedRequest =
        await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne(
          { requestBy: findQuestion.createdBy },
          { requestTo: user._id }
        ).populate({
          path: "requestTo",
          model: "user",
          select: "_id name email region currentRole subject profileImage",
        });
      // console.log("AND-->", answer);
      if (answer) {
        answer = JSON.parse(JSON.stringify(answer));
        if (findRequest) {
          let text = "You have requested access to view profile.";
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.SUCCESS,
            payload: {
              answer,
              count: answer.length,
              text,
              request: findRequest,
              page,
              limit,
            },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (receivedRequest) {
          let text =
            "You have received request to access to view your profile.";
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.SUCCESS,
            payload: {
              answer,
              count: answer.length,
              text,
              request: receivedRequest,
              page,
              limit,
            },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.SUCCESS,
            payload: {
              answer,
              count: answer.length,
              page,
              limit,
            },
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

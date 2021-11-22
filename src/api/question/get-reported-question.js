const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  handler: async (req, res) => {
    const { userId } = req.params;
    const userExists = await global.models.GLOBAL.USER.findById(userId);
    if (!userExists) {
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
      const getReportAbuse = await global.models.GLOBAL.USER.findOne({
        _id: userId,
      }).populate({
        path: "abuseQuestion.questionId",
        model: "question",
        select: "_id question response view createdBy",
      });
      console.log("getReportAbuse---->>>", getReportAbuse);
      if (getReportAbuse) {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_FETCHED,
          payload: { reportedQuestion: getReportAbuse?.abuseQuestion },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "Somethings went wrong to get reported question",
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.BAD_REQUEST)
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

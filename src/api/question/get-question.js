const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");

// Retrieve and return all Question from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { id } = req.query;
    const { byUser } = req.query;
    const { filterId } = req.query;
    let criteria = {};
    if (byUser) {
      criteria = {
        createdBy: user._id,
      };
    }
    console.log("Criteria---->", criteria);
    try {
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      let question = await global.models.GLOBAL.QUESTION.find(criteria)
        .populate({
          path: "createdBy",
          model: "user",
          select: "name",
        })
        .skip(skip)
        .limit(limit);

      // today's Questions Count
      let TodayQuestion = await global.models.GLOBAL.QUESTION.find({
        createdAt: {
          $gte: moment(new Date()).format("YYYY-MM-DD"),
        },
      });

      //Questions Profile access
      let QuestionProfileAccess = await global.models.GLOBAL.QUESTION.find({
        criteria,
        displayProfile: true,
      });

      // Questions without profile Access
      let QuestionProfileWithoutAccess =
        await global.models.GLOBAL.QUESTION.find({
          displayProfile: false,
        });

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: {
          question,
          count: question.length,
          todaysCount: TodayQuestion.length,
          profileaccess: QuestionProfileAccess.length,
          withoutprofileaccess: QuestionProfileWithoutAccess.length,
          page,
          limit,
        },
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

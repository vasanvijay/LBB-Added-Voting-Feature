const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { search } = req.query;
    try {
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      let question = await global.models.GLOBAL.USER.find({ _id: user._id })
        .populate({
          path: "answerLater",
          model: "question",
          select:
            "_id question response filter status view displayProfile createdAt",
        })
        .skip(skip)
        .limit(limit);
      console.log("QUESTION", question[0]?.answerLater);
      if (question) {
        question = JSON.parse(JSON.stringify(question));
        if (search) {
          let abcd = question[0]?.answerLater.filter((question) => {
            if (question.question.search(search) > 0) {
              return question;
            }
          });
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: {
              questions: abcd,
              count: abcd.length,
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
            message: messages.ITEM_FETCHED,
            payload: {
              questions: question[0]?.answerLater,
              count: question[0]?.answerLater.length,
              page,
              limit,
            },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.NOT_FOUND)
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

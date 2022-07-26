const { ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  handler: async (req, res) => {
    const { questionId, status } = req.query;
    let questionExists = await global.models.GLOBAL.QUESTION.findById(questionId);
    if (questionId) {
      if (!questionExists) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return res.status(enums.HTTP_CODES.BAD_REQUEST).json(utils.createResponseObject(data4createResponseObject));
      }
    }
    // console.log("questionExists", questionExists);
    try {
      const updateAbuseQuestion = await global.models.GLOBAL.QUESTION.updateOne(
        { _id: ObjectId(questionId) },
        {
          status: status,
        },
        {
          new: true,
        }
      );

      if (updateAbuseQuestion) {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_UPDATED,
          payload: { updateAbuseQuestion },
          logPayload: false,
        };
        res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "Somethings went wrong to get reported question",
          payload: {},
          logPayload: false,
        };
        res.status(enums.HTTP_CODES.BAD_REQUEST).json(utils.createResponseObject(data4createResponseObject));
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

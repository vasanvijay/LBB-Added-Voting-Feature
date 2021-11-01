const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { sending } = req.query;
    const { received } = req.query;
    const { receiverId } = req.query;
    const { senderId } = req.query;
    let criteria = {};
    if (receiverId) {
      criteria = {
        receiverId: receiverId,
      };
    }
    if (senderId) {
      criteria = {
        senderId: senderId,
      };
    }
    console.log("Criteria---->", criteria);

    try {
      let findConnection;
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      if (sending) {
        findConnection = await global.models.GLOBAL.CONNECTION.find({
          senderId: user._id,
          criteria,
        })
          .skip(skip)
          .limit(limit);
      }
      if (received) {
        findConnection = await global.models.GLOBAL.CONNECTION.find({
          receiverId: user._id,
          criteria,
        })
          .skip(skip)
          .limit(limit);
      }
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: {
          findConnection,
          count: findConnection.length,
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

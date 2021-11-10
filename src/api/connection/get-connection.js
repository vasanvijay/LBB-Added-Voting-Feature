const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { sent } = req.query;
    const { received } = req.query;

    try {
      let findConnection;
      if (sent) {
        findConnection = await global.models.GLOBAL.CONNECTION.find({
          senderId: user._id,
        }).populate({
          path: "receiverId",
          model: "user",
          select: "_id name email image region currentRole",
        });
      }

      if (received) {
        findConnection = await global.models.GLOBAL.CONNECTION.find({
          receiverId: user._id,
        }).populate({
          path: "senderId",
          model: "user",
          select: "_id name email image region currentRole",
        });
      }
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: { findConnection },
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

const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      // let user = await utils.getHeaderFromToken(req.token);
      let { roomId } = req;
      let findRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
        _id: roomId,
      });
      if (findRoom) {
        let findAnswer = await global.models.GLOBAL.ANSWER.find({
          roomId: findRoom._id,
        });

        if (!findAnswer.length < 0) {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.GENERAL,
            payload: {},
            logPayload: false,
          };
          return data4createResponseObject;
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: {
              answer: findAnswer,
            },
            logPayload: false,
          };
          return data4createResponseObject;
        }
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.ITEM_NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return data4createResponseObject;
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
      return data4createResponseObject;
    }
  },
};

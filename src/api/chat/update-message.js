const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const ObjectId = require("mongodb").ObjectId;

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { star } = req.queary;
    const { messageId } = req.params;

    try {
      if (messageId) {
        let starMessage;
        if (star) {
          starMessage = await global.models.GLOBAL.CHAT.findByIdAndUpdate(
            {
              _id: messageId,
            },
            {
              $set: {
                isStar: true,
              },
            },
            {
              new: true,
            }
          );
        } else {
          starMessage = await global.models.GLOBAL.CHAT.findByIdAndUpdate(
            {
              _id: messageId,
            },
            {
              $set: {
                isStar: false,
              },
            },
            {
              new: true,
            }
          );
        }
        if (starMessage) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: "Message status changed successfullyr",
            payload: { starMessage },
            logPayload: false,
          };
          return data4createResponseObject;
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
      return data4createResponseObject;
    }
  },
};

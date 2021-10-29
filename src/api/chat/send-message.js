const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const ObjectId = require("mongodb").ObjectId;

// Add chat by user
module.exports = exports = {
  // route validation
  validation: Joi.object({
    roomId: Joi.string().required(),
    message: Joi.string().required(),
  }),
  handler: async (req, res) => {
    const { roomId, sender, message, type } = req;
    // const { user } = req;
    console.log("reqqqqq", req);
    try {
      let chat = {
        roomId: roomId,
        sender: sender || user._id,
        message: message,
        type: type,
      };

      let newChat = await global.models.GLOBAL.CHAT(chat);
      await newChat.save();

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.MESSAGE_SENT,
        payload: { newChat },
        logPayload: false,
      };
      // res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
      return data4createResponseObject;
    } catch (error) {
      // logger.error(`${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`);
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      // res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
      return data4createResponseObject;
    }
  },
};

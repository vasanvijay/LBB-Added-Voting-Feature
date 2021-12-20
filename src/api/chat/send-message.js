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
    const { roomId, sender, message, type, parentMessageId } = req;
    // console.log("ID-->>", parentMessageId);
    // const { user } = req;
    try {
      let chat = {
        roomId: roomId,
        sender: sender || user._id,
        message: message,
        type: type,
        parentMessageId: parentMessageId,
      };

      let newMessage = await global.models.GLOBAL.CHAT(chat);
      await newMessage.save();

      let newChat = await global.models.GLOBAL.CHAT.findOne({
        _id: newMessage._id,
      }).populate({
        path: "parentMessageId",
        model: "chat",
        select: "roomId sender message messageType type createdAt updatedAt",
      });
      // console.log("NEW CHAT---->>", newChat);
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

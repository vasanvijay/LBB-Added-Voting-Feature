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
        createdAt: Date.now(),
      };

      let newMessage = await global.models.GLOBAL.CHAT.create(chat);

      let newChat = await global.models.GLOBAL.CHAT.findOne({
        _id: newMessage._id,
      }).populate({
        path: "parentMessageId",
        model: "chat",
        select: "roomId sender message messageType type createdAt updatedAt",
      });

      let lastMessageObj = {
        messageId: newMessage._id,
        message: newMessage.message,
      };

      let addLastMessage =
        await global.models.GLOBAL.CHAT_ROOM.findOneAndUpdate(
          {
            _id: roomId,
          },
          { $set: { lastMessage: lastMessageObj } },
          { new: true }
        );
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

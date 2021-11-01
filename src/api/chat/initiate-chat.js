const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const ObjectId = require("mongodb").ObjectId;

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  //  route validation
  validation: Joi.object({
    id: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    try {
      const { id } = req.body;
      const { user } = req;

      let participateIds = [];
      console.log("userr", user);
      // check user type
      participateIds.push(user._id);
      participateIds.push(id);

      let chatRoom = await global.models.GLOBAL.CHAT_ROOM.findOne({
        participateIds: {
          $size: participateIds.length,
          $all: [...participateIds],
        },
      });
      if (chatRoom) {
        console.log("Chat room---<>", chatRoom);
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.INITIATION_SUCCESS,
          payload: { chatRoom },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        chatRoom = await global.models.GLOBAL.CHAT_ROOM({
          participateIds: participateIds,
        });
        chatRoom.save();
        console.log("New Chats room---<>", chatRoom);
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.INITIATION_SUCCESS,
          payload: { chatRoom },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
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

const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const ObjectId = require("mongodb").ObjectId;
const utils = require("../../utils");

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    //    const { roomId } = req;

    let user = await utils.getHeaderFromToken(res);

    try {
      let chats = await global.models.GLOBAL.CHAT.find({
        roomId: req,
      }).populate({
        path: "parentMessageId",
        model: "chat",
        select: "roomId sender message messageType type createdAt updatedAt",
      });
      if (chats) {
        let findRoom = await global.models.GLOBAL.CHAT_ROOM.findOne({
          _id: roomId,
        });
        let findRequest =
          await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne({
            $and: [{ requestBy: user.id }, { requestTo: findRoom.createdBy }],
          }).populate({
            path: "requestBy",
            model: "user",
            select:
              "_id name email region currentRole subject profileImage countryOfResidence",
          });
        let receivedRequest =
          await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne({
            $and: [{ requestBy: findRoom.createdBy }, { requestTo: user.id }],
          }).populate({
            path: "requestTo",
            model: "user",
            select:
              "_id name email region currentRole subject profileImage countryOfResidence",
          });
        console.log("FINDREQU-->", findRequest);
        console.log("receivedRequest-->", receivedRequest);
        if (findRequest) {
          let text = "You have requested access to view profile.";
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.MESSAGES_FETCH_SUCCESS,
            payload: { chats: chats, request: findRequest, text: text },
            logPayload: false,
          };
          //   res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
          return data4createResponseObject;
        } else if (receivedRequest) {
          let text =
            "You have received request to access to view your profile.";
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.MESSAGES_FETCH_SUCCESS,
            payload: { chats: chats, request: receivedRequest, text: text },
            logPayload: false,
          };
          //   res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
          return data4createResponseObject;
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.MESSAGES_FETCH_SUCCESS,
            payload: { chats: chats },
            logPayload: false,
          };
          //   res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
          return data4createResponseObject;
        }
      }
    } catch (error) {
      // logger.error(`${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`);
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      // res.status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(utils.createResponseObject(data4createResponseObject));
      return data4createResponseObject;
    }
  },
};

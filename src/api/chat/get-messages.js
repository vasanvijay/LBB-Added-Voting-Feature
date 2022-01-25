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
    // console.log("USER--->>", user);
    try {
      let chats = await global.models.GLOBAL.CHAT.find({
        roomId: req,
      }).populate({
        path: "parentMessageId",
        model: "chat",
        select: "roomId sender message messageType type createdAt updatedAt",
      });
      // console.log("CHAT-->", chats);
      if (chats) {
        let findRoom = await global.models.GLOBAL.CHAT_ROOM.findOne({
          _id: req,
        }).populate({
          path: "participateIds",
          model: "user",
          match: {
            _id: { $ne: user.id },
          },
          select: "_id name subject profileImage currentRole email blockUser",
        });
        console.log("ROOM--->>", findRoom.participateIds[0]._id);
        console.log("USER--->>", user.id);

        let findRequest =
          await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne({
            $and: [
              { requestBy: user.id },
              { requestTo: findRoom.participateIds[0]._id },
            ],
          }).populate({
            path: "requestBy",
            model: "user",
            select:
              "_id name email region currentRole subject profileImage countryOfResidence",
          });
        let receivedRequest =
          await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne({
            $and: [
              { requestBy: findRoom.participateIds[0]._id },
              { requestTo: user.id },
            ],
          }).populate({
            path: "requestTo",
            model: "user",
            select:
              "_id name email region currentRole subject profileImage countryOfResidence",
          });
        console.log("FINDREQU-->", findRequest);
        console.log("receivedRequest-->", receivedRequest);
        if (findRequest) {
          if (findRequest.status == "accepted") {
            let text = "Your request has been accepted by this user.";

            const data4createResponseObject = {
              req: req,
              result: 0,
              message: messages.ITEM_FETCHED,
              payload: { chats: chats, request: findRequest, text: text },
              logPayload: false,
            };
            return data4createResponseObject;
          } else if (findRequest.status == "decline") {
            let text = "Your request has been declined by this user.";

            const data4createResponseObject = {
              req: req,
              result: 0,
              message: messages.ITEM_FETCHED,
              payload: { chats: chats, request: findRequest, text: text },
              logPayload: false,
            };
            return data4createResponseObject;
          } else {
            let text = "You have requested access to view profile.";

            const data4createResponseObject = {
              req: req,
              result: 0,
              message: messages.ITEM_FETCHED,
              payload: { chats: chats, request: findRequest, text: text },
              logPayload: false,
            };
            return data4createResponseObject;
          }
        } else if (receivedRequest) {
          if (receivedRequest.status == "accepted") {
            let text =
              "You have accepted the request to access to view your profile.";
            const data4createResponseObject = {
              req: req,
              result: 0,
              message: messages.ITEM_FETCHED,
              payload: { chats: chats, request: receivedRequest, text: text },
              logPayload: false,
            };
            return data4createResponseObject;
          } else if (receivedRequest.status == "decline") {
            let text =
              "You have declined the request to access to view your profile.";
            const data4createResponseObject = {
              req: req,
              result: 0,
              message: messages.ITEM_FETCHED,
              payload: { chats: chats, request: receivedRequest, text: text },
              logPayload: false,
            };
            return data4createResponseObject;
          } else {
            let text =
              "You have received request to access to view your profile.";
            const data4createResponseObject = {
              req: req,
              result: 0,
              message: messages.ITEM_FETCHED,
              payload: { chats: chats, request: receivedRequest, text: text },
              logPayload: false,
            };
            return data4createResponseObject;
          }
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.MESSAGES_FETCH_SUCCESS,
            payload: { chats: chats },
            logPayload: false,
          };
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

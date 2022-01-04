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
    const { user } = req;
    // console.log("USER--->>", user);
    try {
      let rooms = [];
      let chats = await global.models.GLOBAL.CHAT_ROOM.find({
        participateIds: { $in: ObjectId(user._id) },
      }).populate({
        path: "participateIds",
        model: "user",
        match: {
          _id: { $ne: user._id },
        },
        select: "_id name subject profileImage currentRole email blockUser",
      });
      //   return res.send(chats);
      chats.map((id) => {
        return rooms.push(id._id);
      });
      // console.log("rooms ", rooms);
      // console.log("chats-------", chats);

      let lastChats = await global.models.GLOBAL.CHAT.aggregate([
        {
          $match: {
            roomId: {
              $in: rooms,
            },
          },
        },
        {
          $group: {
            _id: "$roomId",
            data: {
              $push: {
                message: "$message",
                roomId: "$roomId",
                sender: "$sender",
                createdAt: "$createdAt",
              },
            },
          },
        },
        {
          $unwind: {
            path: "$data",
          },
        },
        {
          $project: {
            _id: 1,
            message: "$data.message",
            roomId: "$data.roomId",
            sender: "$data.sender",
            createdAt: "$data.createdAt",
          },
        },
        {
          $sort: {
            _id: 1,
            createdAt: -1,
          },
        },
        {
          $group: {
            _id: "$_id",
            data: {
              $push: {
                message: "$message",
                roomId: "$roomId",
                sender: "$sender",
                createAt: "$createdAt",
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            data: {
              $slice: ["$data", 1],
            },
          },
        },
        {
          $unwind: {
            path: "$data",
          },
        },
        {
          $project: {
            _id: 1,
            message: "$data.message",
            roomId: "$data.roomId",
            sender: "$data.sender",
            createAt: "$data.createAt",
          },
        },
        {
          $lookup: {
            from: "chat_room",
            localField: "roomId",
            foreignField: "_id",
            as: "room",
          },
        },
        {
          $sort: {
            createAt: -1,
          },
        },
      ]);
      // console.log("lastchat ------------", lastChats);
      //   return res.send({ lastChats, chats.participateIds });
      let chatsData = [];
      for (let i = 0; i < chats.length; i++) {
        let f = 0;
        let checkBlockByMe = await global.models.GLOBAL.USER.findOne({
          $and: [
            {
              _id: user._id,
            },
            { blockUser: { $in: [chats[i].participateIds[0]._id] } },
          ],
        });
        let checkBlockByOther = await global.models.GLOBAL.USER.findOne({
          $and: [
            { _id: chats[i].participateIds[0]._id },
            { blockUser: { $in: [user._id] } },
          ],
        });
        let requestByMe =
          await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne({
            $and: [
              {
                requestBy: user._id,
              },
              { requestTo: chats[i].participateIds[0]._id },
            ],
          });
        let requestByOther =
          await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne({
            $and: [
              {
                requestTo: user._id,
              },
              { requestBy: chats[i].participateIds[0]._id },
            ],
          });
        for (let j = 0; j < lastChats.length; j++) {
          if (
            (chats[i].participateIds[0]._id,
            lastChats[j].room[0].participateIds[1] ==
              `${chats[i].participateIds[0]._id}`) ||
            (chats[i].participateIds[0]._id,
            lastChats[j].room[0].participateIds[0] ==
              `${chats[i].participateIds[0]._id}`)
          ) {
            f = 1;
            console.log("F === 1---->>", requestByMe, requestByOther);
            if (requestByMe !== null) {
              if (checkBlockByMe !== null) {
                // console.log("elsetest-------");
                // chats[i] = { chat: chats[i] };
                chatsData.push({
                  chat: chats[i],
                  lastChat: lastChats[j],
                  text: "Go To Settings & unblock users",
                  request: "You sent a profile access request",
                  request: requestByMe,
                });
              } else if (checkBlockByOther !== null) {
                // console.log("elsetest-------");
                // chats[i] = { chat: chats[i] };
                chatsData.push({
                  chat: chats[i],
                  lastChat: lastChats[j],
                  text: "You are blocked by this user.",
                  request: "You sent a profile access request",
                  request: requestByMe,
                });
              } else {
                chatsData.push({
                  chat: chats[i],
                  lastChat: lastChats[j],
                  request: "You sent a profile access request",
                  request: requestByMe,
                });
              }
            } else if (requestByOther !== null) {
              if (checkBlockByMe !== null) {
                // console.log("elsetest-------");
                // chats[i] = { chat: chats[i] };
                chatsData.push({
                  chat: chats[i],
                  lastChat: lastChats[j],
                  text: "Go To Settings & unblock users",
                  request: "You received a request for accessing your profile.",
                  request: requestByOther,
                });
              } else if (checkBlockByOther !== null) {
                // console.log("elsetest-------");
                // chats[i] = { chat: chats[i] };
                chatsData.push({
                  chat: chats[i],
                  lastChat: lastChats[j],
                  text: "You are blocked by this user.",
                  request: "You received a request for accessing your profile.",
                  request: requestByOther,
                });
              } else {
                chatsData.push({
                  chat: chats[i],
                  lastChat: lastChats[j],
                  request: "You received a request for accessing your profile.",
                  request: requestByOther,
                });
              }
            } else {
              if (checkBlockByMe !== null) {
                // console.log("elsetest-------");
                // chats[i] = { chat: chats[i] };
                chatsData.push({
                  chat: chats[i],
                  lastChat: lastChats[j],
                  text: "Go To Settings & unblock users",
                });
              } else if (checkBlockByOther !== null) {
                // console.log("elsetest-------");
                // chats[i] = { chat: chats[i] };
                chatsData.push({
                  chat: chats[i],
                  lastChat: lastChats[j],
                  text: "You are blocked by this user.",
                });
              } else {
                chatsData.push({
                  chat: chats[i],
                  lastChat: lastChats[j],
                });
              }
            }

            break;
          }
        }

        if (requestByMe !== null) {
          console.log("F === 0---->>", requestByMe, requestByOther);
          if (f == 0 && checkBlockByMe !== null) {
            // console.log("elsetest-------");
            // chats[i] = { chat: chats[i] };
            chatsData.push({
              chat: chats[i],
              text: "Go To Settings & unblock users",
              request: "You sent a profile access request",
              request: requestByMe,
            });
          } else if (f == 0 && checkBlockByOther !== null) {
            // console.log("elsetest-------");
            // chats[i] = { chat: chats[i] };
            chatsData.push({
              chat: chats[i],
              text: "You are blocked by this user.",
              request: "You sent a profile access request",
              request: requestByMe,
            });
          } else if (f == 0) {
            chatsData.push({
              chat: chats[i],
              request: "You sent a profile access request",
              request: requestByMe,
            });
          }
        } else if (requestByOther !== null) {
          console.log("F === 0  ELSE IF---->>", requestByMe, requestByOther);

          if (f == 0 && checkBlockByMe !== null) {
            // console.log("elsetest-------");
            // chats[i] = { chat: chats[i] };
            chatsData.push({
              chat: chats[i],
              text: "Go To Settings & unblock users",
              request: "You received a request for accessing your profile.",
              request: requestByOther,
            });
          } else if (f == 0 && checkBlockByOther !== null) {
            // console.log("elsetest-------");
            // chats[i] = { chat: chats[i] };
            chatsData.push({
              chat: chats[i],
              text: "You are blocked by this user.",
              request: "You received a request for accessing your profile.",
              request: requestByOther,
            });
          } else if (f == 0) {
            chatsData.push({
              chat: chats[i],
              request: "You sent a profile access request",
              request: "You received a request for accessing your profile.",
              request: requestByOther,
            });
          }
        } else {
          console.log("F === 0  ELSE---->>", requestByMe, requestByOther);
          if (f == 0 && checkBlockByMe !== null) {
            // console.log("elsetest-------");
            // chats[i] = { chat: chats[i] };
            chatsData.push({
              chat: chats[i],
              text: "Go To Settings & unblock users",
            });
          } else if (f == 0 && checkBlockByOther !== null) {
            // console.log("elsetest-------");
            // chats[i] = { chat: chats[i] };
            chatsData.push({
              chat: chats[i],
              text: "You are blocked by this user.",
            });
          } else if (f == 0) {
            chatsData.push({
              chat: chats[i],
            });
          }
        }
      }
      // console.log("chatData", chatsData);
      if (lastChats) {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.MESSAGES_FETCH_SUCCESS,
          payload: {
            chats: chatsData,
          },
          logPayload: false,
        };
        return res
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
      return data4createResponseObject;
    }
  },
};

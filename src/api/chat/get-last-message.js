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

    try {
      let rooms = [];
      let chats = await global.models.GLOBAL.CHAT_ROOM.find({
        participateIds: { $in: ObjectId(user._id) },
      }).populate({
        path: "participateIds",
        match: {
          _id: { $ne: user._id },
        },
        select: "_id name subject profileImage currentRole",
      });
      //   return res.send(chats);
      chats.map((id) => {
        return rooms.push(id._id);
      });
      console.log("rooms ", rooms);
      console.log("chats", chats);

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
      ]);
      //   return res.send({ lastChats, chats.participateIds });
      let chatsData = [];
      for (let i = 0; i < chats.length; i++) {
        for (let j = 0; j < lastChats.length; j++) {
          if (
            (chats[i].participateIds[0]._id,
            lastChats[j].room[0].participateIds[1] ==
              `${chats[i].participateIds[0]._id}`)
          ) {
            console.log("test-------");
            chats[i].data = lastChats[j];
            chatsData.push({ lastChat: { ...lastChats[j], chat: chats[i] } });
            break;
          }
        }
      }
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

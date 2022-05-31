const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { sendPushNotification } = require("../../middlewares/pushNotification");
const { getHeaderFromToken } = require("../../utils");
const utils = require("../../utils");

module.exports = exports = {
  //Router Handler
  handler: async ({ user, accepted, receiverId, connectionId }) => {
    // const { user } = req;
    // const { accepted } = req.query;
    // const { receiverId } = req.params;
    // console.log(
    //   "ffffffffffff-----111111111111111111111111111111111111111",
    //   receiverId
    // );
    const userData = await getHeaderFromToken(user);
    // console.log("userData============", userData);
    if (!receiverId) {
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
      // return res
      //   .status(enums.HTTP_CODES.BAD_REQUEST)
      //   .json(utils.createResponseObject(data4createResponseObject));
    }

    if (accepted) {
      // console.log(
      //   "ffffffffffff-----2222222222222222222222222222222222222222222222"
      // );
      let findUser = await global.models.GLOBAL.USER.find({
        _id: userData.id,
      });
      console.log("findUser===================", findUser);
      if (findUser.length > 0) {
        // console.log(
        //   "ffffffffffff-----2222222222222222222222222222222222222222222222333",
        //   findUser
        // );
        try {
          // const { connectionId } = req.body;
          let updatedConnectedData =
            await global.models.GLOBAL.USER.findOneAndUpdate(
              { _id: userData.id },
              {
                $addToSet: {
                  accepted: receiverId,
                },
              },
              { new: true }
            );
          await global.models.GLOBAL.USER.findOneAndUpdate(
            { _id: receiverId },
            {
              $addToSet: {
                accepted: userData.id,
              },
            },
            { new: true }
          );

          // console.log(updatedConnectedData, "updatedConnectedData");
          updatedConnectedData = JSON.parse(
            JSON.stringify(updatedConnectedData)
          );
          let ntfObj = {
            userId: userData.id,
            receiverId: receiverId,
            title: `Notification By ${userData.id} to ${receiverId}`,
            description: {
              data: { title: "Leaderbridge" },
              notification: {
                title: "New Connection Request!!!",
                body: `${userData.currentRole} accepted your connections request.`,
              },
            },
            createdBy: userData.id,
            updatedBy: userData.id,
            createdAt: Date.now(),
          };
          let findToken = await global.models.GLOBAL.USER.findOne({
            _id: receiverId,
          });
          let notification = await global.models.GLOBAL.NOTIFICATION.create(
            ntfObj
          );

          const msg = await global.models.GLOBAL.CONNECTION.findOne({
            _id: connectionId,
          });

          console.log("333332211122", msg);

          const roomExist = await global.models.GLOBAL.CHAT_ROOM.find({
            participateIds: {
              $all: [userData.id, receiverId],
            },
          });

          console.log(roomExist, "roomExist----------123");
          let chatRoom;
          if (roomExist.length == 0) {
            let participateIds = [];
            // check user type
            participateIds.push(userData.id);
            participateIds.push(receiverId);
            chatRoom = await global.models.GLOBAL.CHAT_ROOM.create({
              participateIds: participateIds,
              createdAt: Date.now(),
              createdBy: userData.id,
            });
            // console.log(chatRoom, "chatRoom----------321");
          } else {
            chatRoom = roomExist[0];
            // console.log(chatRoom, "chatRoom----------123");
          }
          // const userOnline = await global.models.GLOBAL.USER.findOne({
          //   _id: ObjectID(receiverId),
          //   // isOnline: true,
          // });

          // console.log("userOnline----------1-1-1-1-", userOnline);
          // console.log(userOnline, "userOnline----------");
          // let isDelivered =
          //   userOnline === null ? false : userOnline.isOnline ? true : false;

          let chat = {
            roomId: chatRoom._id,
            sender: msg.senderId,
            message: msg.message,
            type: "string",
            parentMessageId: null,
            sentTo: [msg.receiverId],
            seenBy: [],
            deliveredTo: [msg.receiverId],
            // deliveredTo: isDelivered ? [receiverId] : [],
            createdAt: Date.now(),
          };

          let newMessage = await global.models.GLOBAL.CHAT.create(chat);
          let lastMessageObj = {
            messageId: newMessage._id,
            message: newMessage.message,
            createdAt: Date.now(),
          };

          let addLastMessage =
            await global.models.GLOBAL.CHAT_ROOM.findOneAndUpdate(
              {
                _id: chatRoom._id,
              },
              { $set: { lastMessage: lastMessageObj } },
              { new: true }
            );
          await global.models.GLOBAL.CONNECTION.findByIdAndRemove({
            _id: connectionId,
          });
          const data4createResponseObject = {
            // req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: { myConnection: updatedConnectedData[0]?.conected },
            logPayload: false,
          };

          // res
          //   .status(enums.HTTP_CODES.OK)
          //   .json(utils.createResponseObject(data4createResponseObject));

          try {
            if (findToken.deviceToken !== "1234") {
              let data = {
                payload: ntfObj.description,
                firebaseToken: findToken.deviceToken,
              };
              sendPushNotification(data);
              // res.status(200).send({
              //   msg: "Notification sent successfully!",
              // });
            }
            // res.status(200).send({
            //   msg: "Notification sent successfully!",
            // });
          } catch (e) {
            // res.status(500).send({
            //   msg: "Unable to send notification!",
            // });
          }
          return data4createResponseObject;
        } catch (error) {
          const data4createResponseObject = {
            // req: req,
            result: -1,
            message: messages.GENERAL,
            payload: {},
            logPayload: false,
          };
          // res
          //   .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
          //   .json(utils.createResponseObject(data4createResponseObject));
          return data4createResponseObject;
        }
      }
    }
  },
};

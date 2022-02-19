const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { sendPushNotification } = require("../../middlewares/pushNotification");
const utils = require("../../utils");

module.exports = exports = {
  //Router Handler
  handler: async (req, res) => {
    const { user } = req;
    const { accepted } = req.query;
    const { receiverId } = req.params;
    if (!receiverId) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }
    if (accepted) {
      let findUser = await global.models.GLOBAL.USER.find({
        _id: user._id,
      });
      if (findUser.length > 0) {
        try {
          const { connectionId } = req.body;
          let updatedConnectedData =
            await global.models.GLOBAL.USER.findOneAndUpdate(
              { _id: user._id },
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
                accepted: user._id,
              },
            },
            { new: true }
          );
          updatedConnectedData = JSON.parse(
            JSON.stringify(updatedConnectedData)
          );
          let ntfObj = {
            userId: user._id,
            receiverId: receiverId,
            title: `Notification By ${user._id} to ${receiverId}`,
            description: {
              data: { title: "Leaderbridge" },
              notification: {
                title: "New Connection Request!!!",
                body: " Accepted your connections request.",
              },
            },
            createdBy: user._id,
            updatedBy: user._id,
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

          let participateIds = [];
          // check user type
          participateIds.push(user._id);
          participateIds.push(receiverId);
          let chatRoom = await global.models.GLOBAL.CHAT_ROOM.create({
            participateIds: participateIds,
            createdAt: Date.now(),
            createdBy: user._id,
          });

          console.log("chatRoom", chatRoom);
          let chat = {
            roomId: chatRoom._id,
            sender: msg.senderId,
            message: msg.message,
            type: "string",
            parentMessageId: null,
            createdAt: Date.now(),
          };

          let newMessage = await global.models.GLOBAL.CHAT.create(chat);

          await global.models.GLOBAL.CONNECTION.findByIdAndRemove({
            _id: connectionId,
          });
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: { myConnection: updatedConnectedData[0]?.conected },
            logPayload: false,
          };

          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
          try {
            if (findToken.deviceToken !== "1234") {
              let data = {
                payload: ntfObj.description,
                firebaseToken: findToken.deviceToken,
              };
              sendPushNotification(data);
              res.status(200).send({
                msg: "Notification sent successfully!",
              });
            }
            res.status(200).send({
              msg: "Notification sent successfully!",
            });
          } catch (e) {
            res.status(500).send({
              msg: "Unable to send notification!",
            });
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
      }
    }
  },
};

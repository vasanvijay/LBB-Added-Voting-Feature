const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { sendPushNotification } = require("../../middlewares/pushNotification");
const utils = require("../../utils");

module.exports = exports = {
  //Router Handler
  handler: async (req, res) => {
    const { user } = req;
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
    let findConnection = await global.models.GLOBAL.CONNECTION.findOne({
      senderId: user._id,
      receiverId: receiverId,
    });
    if (findConnection !== null) {
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_UPDATED,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    } else {
      let findUser = await global.models.GLOBAL.USER.findById(receiverId);
      if (findUser) {
        try {
          const { message } = req.body;
          const request = {
            message: message,
            senderId: user._id,
            receiverId: receiverId,
            status: "Pending",
          };
          const updatedReceiverData =
            await global.models.GLOBAL.CONNECTION.create(request);

          let ntfObj = {
            userId: user._id,
            receiverId: receiverId,
            title: `Notification By ${user._id} to ${receiverId}`,
            description: `${user.subject} sent you a connection request.`,
            createdBy: user._id,
            updatedBy: user._id,
            createdAt: Date.now(),
          };
          let findToken = await global.models.GLOBAL.USER.findOne({
            _id: receiverId,
          });
          try {
            let data = {
              payload: ntfObj.description,
              firebaseToken: findToken.deviceToken,
            };

            sendPushNotification(data);
            res.status(200).send({
              msg: "Notification sent successfully!",
            });
          } catch (e) {
            res.status(500).send({
              msg: "Unable to send notification!",
            });
          }
          let notification = await global.models.GLOBAL.NOTIFICATION.create(
            ntfObj
          );

          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: { updatedReceiverData },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
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
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "User dose not Exist.",
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.NOT_FOUND)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    }
  },
};

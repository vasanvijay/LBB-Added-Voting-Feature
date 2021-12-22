const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
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
          const updatedReceiverData = await global.models.GLOBAL.CONNECTION(
            request
          );
          updatedReceiverData.save();

          let ntfObj = {
            userId: user._id,
            receiverId: receiverId,
            title: `Notification By ${user._id} to ${receiverId}`,
            description: `${user.subject} Sent You the Connection Request.`,
            createdBy: user._id,
            updatedBy: user._id,
          };

          let notification = await global.models.GLOBAL.NOTIFICATION(ntfObj);
          notification.save();

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

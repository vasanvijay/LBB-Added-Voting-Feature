const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  //Router Handler
  handler: async (req, res) => {
    const { user } = req;
    const { userId } = req.params;
    if (!userId) {
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
    let findUser = await global.models.GLOBAL.USER.findById(userId);
    if (findUser) {
      try {
        const updatedBlockUserList =
          await global.models.GLOBAL.USER.findOneAndUpdate(
            { _id: user._id },
            {
              $addToSet: {
                blockUser: userId,
              },
            },
            { new: true }
          );
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.USER_BLOCK,
          payload: { blockUser: updatedBlockUserList.blockUser },
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
        message: messages.NOT_FOUND,
        payload: {},
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.NOT_FOUND)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};

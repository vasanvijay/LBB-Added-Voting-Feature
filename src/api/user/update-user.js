const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Get User by ID
module.exports = exports = {
  handler: async (req, res) => {
    let { user } = req;
    console.log("user------->>", user);
    try {
      let updateUser = await global.models.GLOBAL.USER.findByIdAndUpdate(
        { _id: user._id },
        {
          $set: {
            ...req.body,
            updatedAt: new Date(),
            updatedBy: user.email,
          },
        },
        { new: true }
      );

      if (!updateUser) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.USER_DOES_NOT_EXIST,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.NOT_FOUND)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_UPDATED,
          payload: { updateUser },
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

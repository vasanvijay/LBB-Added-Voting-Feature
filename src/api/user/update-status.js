const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Get User by ID
module.exports = exports = {
  // route validation
  validation: Joi.object({
    name: Joi.string().allow(""),
    status: Joi.string(),
  }),

  handler: async (req, res) => {
    let { user } = req;
    let { userId, status } = req.params;

    try {
      let updateUser;
      if (user.userType === enums.USER_TYPE.ADMIN) {
        if (status) {
          updateUser = await global.models.GLOBAL.USER.findByIdAndUpdate(
            { _id: userId },
            {
              $set: {
                updatedAt: Date.now(),
                updatedBy: user.email,
                status: status,
                message: "",
                text: "",
              },
            },
            { new: true }
          );
        } else {
          updateUser = await global.models.GLOBAL.USER.findByIdAndUpdate(
            { _id: userId },
            {
              $set: {
                updatedAt: Date.now(),
                updatedBy: user.email,
                status: status,
              },
            },
            { new: true }
          );
        }
      }

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

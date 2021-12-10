const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// User Profile update
module.exports = exports = {
  validation: Joi.object({
    password: Joi.string().required(),
  }),
  handler: async (req, res) => {
    // const { user } = req;
    const { userId } = req.params;
    const { password } = req.body;
    if (!password) {
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
    try {
      let findUser = await global.models.GLOBAL.USER.findOne({
        _id: userId,
      });
      if (!findUser) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "Specific user dose not exist.",
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.NOT_ACCEPTABLE)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        let updatePassword = await global.models.GLOBAL.USER.findByIdAndUpdate(
          { _id: userId },
          {
            $set: {
              password: password,
            },
          },
          { new: true }
        );
        if (updatePassword) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.PASSWORD_UPDATED,
            payload: {},
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message:
              "Something Went Wrong to Update Password so please try again Later",
            payload: {},
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.BAD_REQUEST)
            .json(utils.createResponseObject(data4createResponseObject));
        }
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
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};

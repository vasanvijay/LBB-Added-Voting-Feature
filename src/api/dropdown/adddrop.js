const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const jwt = require("jsonwebtoken");
const logger = require("../../logger");
const utils = require("../../utils");
const jwtOptions = require("../../auth/jwt-options");
// User Registration
module.exports = exports = {
  // route validation
  validation: Joi.object({
    title: Joi.string().allow(),
  }),

  handler: async (req, res) => {
    const { title, description, type } = req.body;
    if (!title || !type) {
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
      let adddropdown = {
        dropdown: title,
        createdAt: Date.now(),
        type: type,
      };

      const dropdown = await global.models.GLOBAL.DROPDOWN(adddropdown).save();

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_INSERTED,
        payload: dropdown,
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
  },
};

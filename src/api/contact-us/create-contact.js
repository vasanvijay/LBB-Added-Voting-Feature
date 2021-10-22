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
    name: Joi.string().allow(),
    email: Joi.string().allow(),
    subject: Joi.string().allow(),
    message: Joi.string().allow(),
  }),

  handler: async (req, res) => {
    const { email, name, subject,message } = req.body;
    if (!email || !name ||!subject|| !message) {
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
     console.log("newbody", req.body)

    try {
      let findUser = await global.models.GLOBAL.CONTACT.find({
        $and: [
          {
            $or: [{ email: { $eq: email } }],
          },
        ],
      });
      if (findUser.length > 0) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.USER_ALREADY_EXISTS,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.NOT_ACCEPTABLE)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        let userRegistration = {
          email: email,
          name: name,
          subject: subject,
          message: message,
 
        };

        try {
          
        const newUser = await global.models.GLOBAL.CONTACT(userRegistration).save();


        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.CONTACT_USER,
          payload: newUser,
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));

        } catch (error) {
          logger.error(
            "/user - Error encountered while trying to add new user:\n" + error
          );
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.FAILED_REGISTRATION,
            payload: {},
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
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
      res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};

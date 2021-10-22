const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const jwt = require("jsonwebtoken");
const jwtOptions = require("../../auth/jwt-options");

// User Login
module.exports = exports = {
  // route validation
  validation: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),

  handler: async (req, res) => {
    const { email, password } = req.body;
    console.log("req.body", req.body);
    if (!email || !password) {
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
        email: email,
      });
      if (!findUser) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.USER_DOES_NOT_EXIST,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        if (findUser.password !== password) {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.USER_NOT_FOUND,
            payload: {},
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          // User found - create JWT and return it
          const data4token = {
            id: findUser._id,
            date: new Date(),
            environment: process.env.APP_ENVIRONMENT,
            email: email,
            userType: findUser.userType,
            scope: "login",
          };

          await global.models.GLOBAL.USER.findByIdAndUpdate(findUser._id, {
            $set: { lastLogin: new Date() },
          });
          delete findUser.password;
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.USER_LOGIN_SUCCESSFULLY,
            payload: {
              user: findUser,
              token: jwt.sign(data4token, jwtOptions.secretOrKey),
            },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
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

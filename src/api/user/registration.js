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
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    deviceToken: Joi.string().allow(),
    checkbox: Joi.allow(),
  }),

  handler: async (req, res) => {
    const { email, name, password, deviceToken, checkbox } = req.body;
    console.log("req.body--------------------------new user", req.body);
    if (!email || !name || !password) {
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
      let findUser = await global.models.GLOBAL.USER.find({
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
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4token = {
          date: Date.now(),
          environment: process.env.APP_ENVIRONMENT,
          name: name,
          email: email,
          date: Date.now(),
          scope: "signup",
        };
        let userRegistration = {
          email: email,
          name: name,
          password: password,
          deviceToken: deviceToken,
          checkbox: checkbox,
          token: jwt.sign(data4token, jwtOptions.secretOrKey),
          createdAt: Date.now(),
        };

        const newUser = await global.models.GLOBAL.USER(userRegistration);
        const contregister = await global.models.GLOBAL.USER.count(
          userRegistration
        );
        try {
          await newUser.save();
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

        const responseObj = {
          createdBy: newUser.createdBy,
          updatedBy: newUser.updatedBy,
          token: newUser.token,
          _id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
          lastLogin: newUser.lastLogin,
          userType: newUser.userType,
          deviceToken: newUser.deviceToken,
        };

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.USER_REGISTRATION_SUCCESS,
          payload: responseObj,

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

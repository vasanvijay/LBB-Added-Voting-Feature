const _ = require("lodash");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const jwtOptions = require("../../auth/jwt-options");
const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  // route validation
  validation: Joi.object({
    code: Joi.string().required(),
    email: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    let { code, email } = req.body;

    if (email.length === 0 || code.length === 0) {
      logger.error("/verify-code - Email and code cannot be empty!");
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: "Email and code cannot be empty!",
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }
    email = email.removeSpaces();

    // Find the email and code object and then delete it.
    let verificationEntry;
    try {
      verificationEntry = await global.models.GLOBAL.CODE_VERIFICATION.findOne({
        email: email,
      });
    } catch (error) {
      logger.error(
        `/verify-code - Error encountered while verifying email: ${error.message}\n${error.stack}`
      );
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: "Error",
        payload: { error: error },
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    if (!verificationEntry) {
      // SMS verification failed
      logger.error(
        `/verify-code - SMS verification for USER (email: ${email}) failed!`
      );
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.FAILED_VERIFICATION,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    // Check number of attempts and expiryTime
    const now = moment();
    const expirationDate = moment(verificationEntry.expirationDate); // another date
    if (now.isAfter(expirationDate)) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.EXPIRED_VERIFICATION,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    if (verificationEntry.code !== code) {
      verificationEntry.failedAttempts++;
      await verificationEntry.save();
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.FAILED_OTP,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    /* SMS verification done */
    logger.info(
      `/verify-code - SMS verification for USER (email: ${email}) successful!`
    );

    // Find the email no in user data if it exists or not.
    let user = await global.models.GLOBAL.USER.findOne({ email: email });
    if (user !== null) {
      let verified = await global.models.GLOBAL.USER.findOneAndUpdate(
        { email: email },
        { $set: { verified: true } },
        { new: true }
      );
      // User found - create JWT and return it
      const data4token = {
        id: user._id,
        date: Date.now(),
        environment: process.env.APP_ENVIRONMENT,
        email: email,
        scope: "login",
        type: enums.USER_TYPE.USER,
      };
      const payload = {
        user: user,
        userExist: true,
        verified: true,
        token: jwt.sign(data4token, jwtOptions.secretOrKey),
        token_type: "Bearer",
      };
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.VERIFICATION_SUCCESS,
        payload: payload,
        logPayload: false,
      };
      // verificationEntry.delete();
      // !delete verification entry [Prodcution]
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
      return;
    } else {
      // Generate token and enter into the registration collection
      const payload = {
        email: email,
        date: Date.now(),
        scope: "verification",
      };
      const token = jwt.sign(payload, jwtOptions.secretOrKey);
      const entry = global.models.GLOBAL.CODE_REGISTRATION({
        email: email,
        code: token,
        date: Date.now(),
      });
      logger.info("/verify-code - Saving registration-code in database");
      try {
        await entry.save();
      } catch (error) {
        logger.error(
          `/verify-code - Error encountered while saving registration-code: ${error.message}\n${error.stack}`
        );
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.FAILED_VERIFICATION,
          payload: { error: error },
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
          .json(utils.createResponseObject(data4createResponseObject));
      }
      if (verified.length > 0) {
        let verified = await global.models.GLOBAL.USER.findOneAndUpdate(
          { email: email },
          { $set: [{ verified: true }] },
          { new: true }
        );
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.VERIFICATION_SUCCESS,
          payload: {
            userExist: false,
            verified: true,
            token: token,
          },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    }
  },
};

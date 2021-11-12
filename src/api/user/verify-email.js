const Joi = require("joi");
const enums = require("../../../json/enums.json");
const events = require("../../../json/events.json");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const utils = require("../../utils");
const config = require("../../../config.json");
const nodemailer = require("nodemailer");

module.exports = exports = {
  // route validation
  validation: Joi.object({
    email: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    const { email } = req.body;

    let code = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
    console.log("Code---------->>>", code);
    // const locale = utils.getLocale(req);
    let entry;
    // If codes already exists for this email in the database delete them
    let findUser = await global.models.GLOBAL.USER.findOne({
      $or: [{ email: { $eq: email } }],
    });
    console.log("user------>", findUser);
    try {
      if (String(findUser.email) === String(email)) {
        if (!email) {
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
        } else {
          await global.models.GLOBAL.CODE_VERIFICATION.deleteMany({
            email: email,
          });
        }
      }
    } catch (error) {
      logger.error(
        `${req.originalUrl} - Error while deleting the old codes from the database: ${error.message}\n${error.stack}`
      );
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.FAILED_VERIFICATION,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    // When USE_TEST_PIN is true (config.json)
    try {
      if (String(findUser.email) === String(email)) {
        console.log("MAIL SENDING");
        let transporter = nodemailer.createTransport({
          service: "gmail",
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
          },
        });
        let info = await transporter.sendMail({
          from: process.env.EMAIL,
          to: email,
          subject: "Account Verification Code",
          html: `Email :- ${email} <br /><br />
        One Time Code:- ${code}`,
        });
        console.log("Message sent: %s", info.messageId);

        if (config.MONGODB.GLOBAL.USE_TEST_PIN) {
          // If (dummyAccount) {
          code = code;
          console.log("CODE NEw----=======>>>>>", code);
          // Save the code in database
          entry = global.models.GLOBAL.CODE_VERIFICATION({
            email: email,
            code: code,
            date: Date.now(),
            expirationDate: Date.now() + 300 * 1000,
            failedAttempts: 0,
          });

          logger.info("/verify-email - Saving verification-code in database");
          try {
            await entry.save();
          } catch (error) {
            logger.error(
              `/verify-email - Error while saving code in database: ${error.message}\n${error.stack}`
            );
            const data4createResponseObject = {
              req: req,
              result: -1,
              message: messages.FAILED_VERIFICATION,
              payload: {},
              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
              .json(utils.createResponseObject(data4createResponseObject));
          }
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: "Mail was sent out to the Email Address.",
            payload: {},
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      }
    } catch (error) {
      logger.error(
        `${req.originalUrl} - Error while sending Mail : ${error.message}\n${error.stack}`
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

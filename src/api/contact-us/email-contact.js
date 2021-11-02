const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const jwt = require("jsonwebtoken");
const logger = require("../../logger");
const utils = require("../../utils");
const jwtOptions = require("../../auth/jwt-options");
const nodemailer = require("nodemailer");

// User Registration
module.exports = exports = {
  // route validation
  // validation: Joi.object({
  //   name: Joi.string().allow(),
  //   email: Joi.string().allow(),
  //   subject: Joi.string().allow(),
  //   message: Joi.string().allow(),
  // }),

  handler: async (req, res) => {
    const { id, email, subject, message } = req.body;
    if (!email || !subject || !message) {
      const Datanodemailererror = {
        req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };

      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(Datanodemailererror));
    }
    try {
      let findEmailuser = await global.models.GLOBAL.CONTACT.find({
        email: email,
      });
      if (findEmailuser.length > 0) {
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
          subject: subject,
          text: message,
        });
        console.log("Message sent: %s", info.messageId);
        const Replayfiledtrue =
          await global.models.GLOBAL.CONTACT.findByIdAndUpdate(id, {
            reply: true,
          });
        console.log("Replayfiledtrue", Replayfiledtrue);
        if (Replayfiledtrue) {
          await Replayfiledtrue.save();

          const emailsendsuccessfully = {
            id: id,
            email: email,
            subject: subject,
            message: message,
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.MAIL_SENT,
            payload: { emailsendsuccessfully },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.GENERAL,
            payload: {},
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
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
        return res
          .status(enums.HTTP_CODES.NOT_FOUND)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    } catch (error) {}
  },
};

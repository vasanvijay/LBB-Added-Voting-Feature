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
  //   validation: Joi.object({
  //     email: Joi.string().required(),
  //   }),

  // route handler
  handler: async (req, res) => {
    let { html } = req.body;
    let code = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
    // // console.log("Code---------->>>", code);
    // const locale = utils.getLocale(req);
    let entry;
    // If codes already exists for this email in the database delete them
    let findUser = await global.models.GLOBAL.USER.find({
      //   $or: [{ email: { $eq: email } }],
    });

    console.log("findUser---------->>>", html);

    // const data4createResponseObject = {
    //   req: req,
    //   result: -1,
    //   message: findUser,
    //   payload: {},
    //   logPayload: false,
    // };
    // return res
    //   .status(enums.HTTP_CODES.OK)
    //   .json(utils.createResponseObject(data4createResponseObject));

    const FFF = [
      {
        email: "vishv@yopmail.com",
        _id: "624d5c7e9d7a9e468822a071",
      },

      {
        email: "vijay085.rejoice@gmail.com",
        _id: "624d364df458670d1ce41b64",
      },
    ];

    // When USE_TEST_PIN is true (config.json)
    try {
      if (FFF) {
        // console.log("MAIL SENDING");
        let transporter = nodemailer.createTransport({
          host: process.env.HOST,
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.PASSWORD,
          },
        });

        for (let i = 0; i < FFF.length; i++) {
          await global.models.GLOBAL.USER.findByIdAndUpdate(
            { _id: FFF[i]._id },
            { $set: { isSubmit: false } }
          );
          html = html.replace(/\[\[name\]\]/g, FFF[i].email);
          html = html.replace(/\[\[uid\]\]/g, FFF[i]._id);
          let info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: FFF[i].email,
            subject: "LeaderBridge | OTP To Verify Your Email",
            html: `${html}`,
          });
        }

        // console.log("Message sent: %s", info.messageId);

        // If (dummyAccount) {
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

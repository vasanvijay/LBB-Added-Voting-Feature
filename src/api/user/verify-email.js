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
          subject: "LeaderBridge| OTP To Verify Your Email",
          html: `<!DOCTYPE html>
                <html lang="en">
                
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
                </head>
                <style>
                    body {
                        font-family: 'Ubuntu', sans-serif;
                        background-color: #f5f5f5;
                    }
                
                    * {
                        box-sizing: border-box;
                    }
                
                    p:last-child {
                        margin-top: 0;
                    }
                
                    img {
                        max-width: 100%;
                    }
                </style>
                
                <body style="margin: 0; padding: 0;">
                    <table cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="padding: 20px 0 30px 0;">
                                <table align="center" cellpadding="0" cellspacing="0" width="600" style=" border-collapse: collapse; border: 1px solid #ececec; background-color: #fff;">
                                    <tr>
                                        <td align="center" style="position: relative;">
                                            <div
                                            class="company-logo-align"
                                            style=" padding: 2rem 2rem 1rem 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto;"
                                            align="center">
                                                <img  src="https://www.leaderbridge.com/frontend-assets/images/logo/logo-lb.png" style= "margin:0 auto; width: 80px;height: 80px;cursor: pointer;"/>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="user-information" 
                                            style="padding: 25px; background-color: #021f4c; width: 91.6%;"
                                            >
                                            <h1 align="center" style="color: #fff; font-size: 35px; font-weight: 500; margin: 0 0 1rem 0;">Hi ${findUser.name}</h1>
                                            <p align="center" style="color: #fff; font-size: 30px; font-weight: 500; margin: 0 0 1rem 0;">Welcome to LeaderBridge®</p>
                                            <span align="center" style="display: block; font-size: 16px; color: #fff;">Thank you for signing up on LeaderBridge®</span>
                                            </div>
                                          
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 3rem 2rem 2rem 2rem;">
                                          <h2 align="center" style="color: #585d6a; font-size: 30px; ">Verify your Email Address</h2>
                                          <p align="center" style="color: #585d6a; font-size: 14px; margin: 2.50rem 0 2rem 0;">Please find below your one time passcode.</p>
                                          <h6 align="center" style="font-size: 40px; color: #585d6a; margin: 0;  margin-top: 0;">OTP : ${code}</h6>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 3rem 2rem 2rem 2rem;">
                                          <p align="center" style="color: #585d6a; font-size: 14px; margin: 0;">
                                            If you have any query, feel free to contact us at support@leaderbridge.com.
                                          </p>
                                        </td>
                                    </tr>
                                  
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                
                </html>`,
        });
        console.log("Message sent: %s", info.messageId);

        if (config.MONGODB.GLOBAL.USE_TEST_PIN) {
          // If (dummyAccount) {
          code = code;
          // Save the code in database
          entry = global.models.GLOBAL.CODE_VERIFICATION({
            email: email,
            code: code,
            date: new Date(),
            expirationDate: new Date(NOW + 300 * 1000),
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

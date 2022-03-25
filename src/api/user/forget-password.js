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

    let findUser = await global.models.GLOBAL.USER.findOne({
      $or: [{ email: { $eq: email } }],
    });
    // try {
    if (findUser) {
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
          let transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: 587,
            secure: false,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.PASSWORD,
            },
          });
          console.log("transporter", transporter);
          let info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Reset Your Password",
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
                                                    <img  src="https://leadersbridge.s3.amazonaws.com/site-assets/logo.png" style= "margin:0 auto; width: 80px;height: 80px;cursor: pointer;"/>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div class="user-information" 
                                                style="padding: 25px; background-color: #fff; width: 91.6%;"
                                                >
                                                <p align="left" style="color: #585d6a; font-size: 14px; margin: 0;">Hi ${findUser.name}</p>
                                                <p align="left" style="color: #000000; font-size: 30px; font-weight: 500; margin: 0 0 1rem 0;">We recieve your request to reset your password. Click the button below to get started.</p>

                                                <p align="left" style="color: #585d6a; font-size: 14px; margin: 0;">If it doesn’t work, you can copy and paste the following link in your browser:</p>
                                                <p align="left" style="color: #585d6a; font-size: 14px; margin: 0;"><a href="https://leaderbridge.com/reset-password/${findUser._id}">https://leaderbridge.com/reset-password/${findUser._id}</a></p>
                                                <p align="left" style="color: #585d6a; font-size: 14px; margin: 0;">Regards</p>
                                                <p align="left" style="color: #585d6a; font-size: 14px; margin: 0;">LeaderBridge Team</p>
                                                <p align="center" style="color: #585d6a; font-size: 14px; margin: 0;">If you have any questions, feel free message us at support@leaderbridge.com.</p>
                                                <p align="center" style="color: #585d6a; font-size: 14px; margin: 0;">All rights reserved LeaderBridge® .</p>
                                                </div>
                                              
                                            </td>
                                            <td></td>
                                        </tr>                                      
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    
                    </html>`,
          });
          console.log("Message sent: %s", info);
        }
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.MAIL_SENT,
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
        message: messages.USER_DOES_NOT_EXIST,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.METHOD_NOT_ALLOWED)
        .json(utils.createResponseObject(data4createResponseObject));
    }
    // } catch (error) {
    //   logger.error(
    //     `${req.originalUrl} - Error while deleting the old codes from the database: ${error.message}\n${error.stack}`
    //   );
    //   const data4createResponseObject = {
    //     req: req,
    //     result: -1,
    //     message: messages.FAILED_VERIFICATION,
    //     payload: {},
    //     logPayload: false,
    //   };
    //   return res
    //     .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
    //     .json(utils.createResponseObject(data4createResponseObject));
    // }
  },
};

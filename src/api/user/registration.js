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
  validation: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),

  handler: async (req, res) => {
    const { email, name, password } = req.body;
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
          date: new Date(),
          environment: process.env.APP_ENVIRONMENT,
          name: name,
          email: email,
          date: new Date(),
          scope: "signup",
        };
        let userRegistration = {
          email: email,
          name: name,
          password: password,
          token: jwt.sign(data4token, jwtOptions.secretOrKey),
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
            <title> first page </title>
        </head>
        <style>
            body {
                font-family: 'Ubuntu', sans-serif;
                background-color: #F5F5F5;
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
            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
                margin-top: 0;
            }
            .company-logo-align {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .company-logo-align img {
                width: 80px;
                height: 80px;
                cursor: pointer;
            }
            .user-information {
                background-color: #021F4C;
                width: 100%;
            }
        </style>
        <body style="margin: 0; padding: 0;">
            <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td style="padding: 20px 0 30px 0;">
                        <table align="center" cellpadding="0" cellspacing="0" width="600" style=" border-collapse: collapse; border: 1px solid #ECECEC; background-color: #fff;">
                            <tr>
                                <td style="position: relative;">
                                    <div
                                    class="company-logo-align"
                                    style=" padding: 2rem 2rem 1rem 2rem;"
                                    align="center">
                                        <img src="https://www.leaderbridge.com/frontend-assets/images/logo/logo-lb.png"/>
                                    </div>
                                    <h1 align="center" style="color: #021F4C; font-size: 30px; line-height: 40px; margin: 0 0 2rem 0;">Welcome</h1>
                                </td>
                            </tr>
                        <tr>
                            <td style="padding:  0 30px 30px 30px;">
                                <span style="font-size: 16px; line-height: 22px; color: #323232; padding-bottom: 1.25rem; display: block;">Hi DyeTo,</span>
                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Welcome to the LeaderBridge® Family!</p>
                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                    Because this is a Beta launch and the value of the network increases with the number of members, we will inform you by email of our progress in reaching the first 500 members. At that point, as an early subscriber, you will still have 12 more months of free use. We’ll inform you in advance before the 12 months are up. (The charge at that point will be $10 per month.) If you wish, you can turn off the sound of LeaderBridge® notifications by going to the three-vertical-dot More Options icon and choosing Settings. You
                                    will still receive notifications by email when we reach key numbers of subscribers.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:  60px 30px 30px 30px;">
                                <span style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">Regards</span>
                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">John Behr</p>
                            </td>
                        </tr>
                        <tr>
                            <td  style="padding:  0 30px 30px 30px;">
                                <p align="center" style="font-size: 14px; line-height: 22px; color: #757575; margin: 0;">If you have any questions, feel free message us at
                                    <a target="_blank" style="color: #757575; text-decoration: none;" href = "mailto:support@leaderbridge.com?subject = Feedback&body = Message">
                                    support@leaderbridge.com.
                                    </a>
                                </p>
                                <p align="center" style="font-size: 14px; line-height: 22px; color: #757575; margin: 0;"> All rights reserved LeaderBridge® .</p>
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

const { createCanvas, loadImage } = require("canvas");
const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const utils = require("../../utils");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const jwtOptions = require("../../auth/jwt-options");

// User Registration
module.exports = exports = {
  // route validation
  validation: Joi.object({
    email: Joi.string().required(),
    phone: Joi.string().required(),
    fname: Joi.string().required(),
    lname: Joi.string().required(),
    organizationName: Joi.string().required(),
    currentRole: Joi.string().required(),
    organizationEmail: Joi.string().required(),
    organizationWebsite: Joi.string().allow(""),
    programName: Joi.string().allow(""),
    programType: Joi.string().allow(""),
    permission: Joi.boolean().default(false),
  }),

  handler: async (req, res) => {
    const {
      email,
      phone,
      fname,
      lname,
      organizationName,
      currentRole,
      organizationEmail,
      organizationWebsite,
      programName,
      programType,
      permission,
    } = req.body;
    if (
      !organizationName ||
      !currentRole ||
      !organizationEmail ||
      !fname ||
      !lname ||
      !email ||
      !phone
    ) {
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
        $or: [
          { email: { $eq: organizationEmail } },
          { organizationEmail: { $eq: organizationEmail } },
        ],
      });
      if (findUser) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.USER_ALREADY_EXISTS,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.BAD_REQUEST)
          .json(utils.createResponseObject(data4createResponseObject));
      }
      //create unique organization password alphanumeric string length of 8
      let organizationPassword = Math.random().toString(36).substring(2, 11);
      organizationPassword = organizationPassword + "A1@";
      //encrypt organization password
      let password = utils.passwordHash(organizationPassword);

      let data4token = {
        organizationName: organizationName,
        currentRole: currentRole,
        email: email,
        password: password,
        phone: phone,
        fname: fname,
        lname: lname,
        organizationEmail: organizationEmail,
        organizationWebsite: organizationWebsite,
        programName: programName,
        programType: programType,
        permission: permission,
        isOrganization: true,
        pwReset: true,
        verified: true,
        formFilled: true,
        date: Date.now(),
        scope: "signup",
        // organizationId: organizationId || null,
      };

      let userRegistration = {
        organizationName: organizationName,
        currentRole: currentRole,
        email: email,
        password: password,
        phone: phone,
        fname: fname,
        lname: lname,
        organizationEmail: organizationEmail,
        organizationWebsite: organizationWebsite,
        programName: programName,
        programType: programType,
        permission: permission,
        isOrganization: true,
        pwReset: true,
        verified: true,
        formFilled: true,
        token: jwt.sign(data4token, jwtOptions.secretOrKey),
        // organizationId: organizationId || null,
      };

      let fillForm = await global.models.GLOBAL.USER.create(userRegistration);

      if (!fillForm) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.GENERAL,
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
        let info = await transporter.sendMail({
          from: process.env.EMAIL,
          to: organizationEmail,
          subject: "Reminder from LeaderBridge",
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
                                  <td style="padding:  0 30px 30px 30px;">
                                      <span style="font-size: 16px; line-height: 22px; color: #323232; padding-bottom: 1.25rem; display: block;">Hi ${organizationName},</span>

                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Welcome to the LeaderBridge® Family!</p>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Please use this password to login: ${organizationPassword}</p>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Please use this id for organization: ${fillForm._id}</p>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                      Just wanted to remind you that your LeaderBridge account is setup and ready for you to add your logo and the description you want displayed when visitors click on your logo.

                                      To add these, please go to LeaderBridge.com and login.  You’ll be taken to your account page where you can upload your logo and enter the description text.

                                      Sincerely,
                                      The LeaderBridge Team
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
        // console.log("Message sent: %s", info.messageId);
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_UPDATED,
          payload: {
            fillForm,
            // token: jwt.sign(data4token, jwtOptions.secretOrKey),
          },
          logPayload: false,
        };
        return res
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

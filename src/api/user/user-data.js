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
    organizationName: Joi.string().required(),
    currentRole: Joi.string().required(),
    region: Joi.string().required(),
    organizationEmail: Joi.string().required(),
    linkedinProfile: Joi.string().required(),
    organizationWebsite: Joi.string().allow(""),
    otherLink: Joi.string().allow(""),
    howDidFind: Joi.string().required(),
    subject: Joi.array().required(),
  }),

  handler: async (req, res) => {
    const {
      email,
      organizationName,
      currentRole,
      region,
      organizationEmail,
      linkedinProfile,
      organizationWebsite,
      otherLink,
      howDidFind,
      subject,
    } = req.body;
    if (
      !organizationName ||
      !currentRole ||
      !region ||
      !organizationEmail ||
      !linkedinProfile ||
      !subject
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
        $or: [{ email: { $eq: email } }],
      });
      if (findUser) {
        const ImagesList = await global.models.GLOBAL.LEGENDS.aggregate([
          {
            $match: { legendsName: { $in: subject } },
          },
          {
            $group: { _id: "$legendsIcon" },
          },
        ]);
        if (ImagesList.length !== 4) {
          return res.status(400).json({
            message: "Please provide 4 images",
          });
        } else {
          const canvasWidth = 1024;
          const canvasHeight = 1024;
          //load canvas
          const myCanvas = createCanvas(canvasWidth, canvasHeight, "PNG");
          const context = myCanvas.getContext("2d");

          //load images && draw image in existing canvas

          let imageWidth = 0;
          let imageHeight = 0;
          for (i = 0; i < ImagesList.length; i++) {
            await loadImage(ImagesList[i]._id).then(async (image) => {
              await context.drawImage(image, imageWidth, imageHeight);
              imageHeight =
                canvasHeight > imageHeight * 2 ? imageWidth : imageHeight;
              imageWidth =
                canvasWidth > imageWidth * 2 ? 0.5 * canvasHeight : 0;
            });
          }
          let image = await utils.uploadBase(
            myCanvas.toDataURL(),
            findUser._id
          );
          let fillForm = await global.models.GLOBAL.USER.findOneAndUpdate(
            { email: email },
            {
              $set: {
                profileImage: image,
                organizationName: organizationName,
                currentRole: currentRole,
                region: region,
                organizationEmail: organizationEmail,
                linkedinProfile: linkedinProfile,
                organizationWebsite: organizationWebsite,
                otherLink: otherLink,
                howDidFind: howDidFind,
                subject: subject,
                formFilled: true,
              },
            },
            { new: true }
          );

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
            const data4token = {
              id: findUser._id,
              date: Date.now(),
              environment: process.env.APP_ENVIRONMENT,
              email: email,
              userType: findUser.userType,
              subject: findUser.subject,
              abuseQuestion: findUser.abuseQuestion,
              abuseAnswer: findUser.abuseAnswer,
              scope: "signup",
            };

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
              to: email,
              subject: "LeaderBridge | Welcome",
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
                                      <span style="font-size: 16px; line-height: 22px; color: #323232; padding-bottom: 1.25rem; display: block;">Hello ${findUser.name},</span>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Welcome to the LeaderBridge® Family!</p>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                          Because this is a Beta launch and the value of the network increases with the number of members, we will inform you by email of our progress in reaching the first 500 members. At that point, as an early subscriber, you will still have 12 more months of free use. We’ll inform you in advance before the 12 months are up. If you wish, you can turn off the sound of LeaderBridge® notifications by going to the three-vertical-dot More Options icon and choosing Settings. You
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
            // console.log("Message sent: %s", info.messageId);
            const data4createResponseObject = {
              req: req,
              result: 0,
              message: messages.ITEM_UPDATED,
              payload: {
                fillForm,
                token: jwt.sign(data4token, jwtOptions.secretOrKey),
              },
              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          }
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
          .status(enums.HTTP_CODES.NOT_FOUND)
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

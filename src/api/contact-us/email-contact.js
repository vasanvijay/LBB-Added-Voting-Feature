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
    console.log("nodemailer");
    const { id, email, subject, message } = req.body;
    console.log(email, "newemail");
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
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "vijay085.rejoice@gmail.com",
          pass: "Vijay42497884+++",
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      let mailOptions = {
        from: "vijay085.rejoice@gmail.com",
        to: email,
        subject: subject,
        text: message,
      };

      let info = await transporter.sendMail(mailOptions);

      console.log(info, "infoemail");
      if (info.accepted.length > 0) {
        // message sent

        let findEmailuser = await global.models.GLOBAL.CONTACT.find({
          email: email,
        });

        if (findEmailuser.length == 0) {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: "email does not exist",
         
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
            
        } else {
          try {
          const Replayfiledtrue =
            await global.models.GLOBAL.CONTACT.findByIdAndUpdate(id, {
              reply: true,
            });
            console.log("Replayfiledtrue",Replayfiledtrue);
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
                result: -1,
                message: "Email successfully sent",
                payload: { emailsendsuccessfully },
                logPayload: false,
              };
              return res
                .status(enums.HTTP_CODES.OK)
                .json(utils.createResponseObject(data4createResponseObject));
            } else {
              console.log("email not Exits");
            }
          } catch (error) {}
        }
      } else {
        // message not sent
      }
    } catch (error) {
      console.log("ERR")
    }
  },
};

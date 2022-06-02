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
    const { id, email, subject, message, name } = req.body;
    if (!email || !subject || !message || !name) {
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
          subject: subject,
          html: `


          <!doctype html>
                    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                      <head>
                        <title>
                        </title>
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <style type="text/css">
                          #outlook a{padding: 0;}
                                .ReadMsgBody{width: 100%;}
                                .ExternalClass{width: 100%;}
                                .ExternalClass *{line-height: 100%;}
                                body{margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}
                                table, td{border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;}
                                img{border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;}
                                p{display: block; margin: 13px 0;}
                        </style>
                        <!--[if !mso]><!-->
                        <style type="text/css">
                          @media only screen and (max-width:480px) {
                                      @-ms-viewport {width: 320px;}
                                      @viewport {	width: 320px; }
                                  }
                        </style>
                        <!--<![endif]-->
                        <!--[if mso]> 
                        <xml> 
                          <o:OfficeDocumentSettings> 
                            <o:AllowPNG/> 
                            <o:PixelsPerInch>96</o:PixelsPerInch> 
                          </o:OfficeDocumentSettings> 
                        </xml>
                        <![endif]-->
                        <!--[if lte mso 11]> 
                        <style type="text/css"> 
                          .outlook-group-fix{width:100% !important;}
                        </style>
                        <![endif]-->
                        <style type="text/css">
                          @media only screen and (max-width:480px) {
                          
                                  table.full-width-mobile { width: 100% !important; }
                                  td.full-width-mobile { width: auto !important; }
                          
                          }
                          @media only screen and (min-width:480px) {
                          .dys-column-per-100 {
                            width: 100.000000% !important;
                            max-width: 100.000000%;
                          }
                          }
                          @media only screen and (min-width:480px) {
                          .dys-column-per-100 {
                            width: 100.000000% !important;
                            max-width: 100.000000%;
                          }
                          }
                          @media only screen and (min-width:480px) {
                          .dys-column-per-100 {
                            width: 100.000000% !important;
                            max-width: 100.000000%;
                          }
                          }
                        </style>
                      </head>
                      <body>
                        <div>
                          <!--[if mso | IE]>
                    <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:600px;" width="600"><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                    <![endif]-->
                          <div style='margin:0px auto;max-width:600px;'>
                            <table align='center' border='0' cellpadding='0' cellspacing='0' role='presentation' style='width:100%;'>
                              <tbody>
                                <tr>
                                  <td style='direction:ltr;font-size:0px;text-align:center;vertical-align:top;'>
                                    <!--[if mso | IE]>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:600px;">
                    <![endif]-->
          
          
                                    <img alt='LoGo Here' height='80' src='https://leadersbridge.s3.amazonaws.com/site-assets/logo.png' style='border:0;display:block;font-size:13px;height: 90px;;outline:none;text-decoration:none;width: 90px; margin: 0 auto' width='60' />
                                    <table border='0' cellpadding='0' cellspacing='0' role='presentation' style='vertical-align:top;' width='100%'>
                                
                                          <div style='color:#000000;font-family:Open Sans, Arial, sans-serif;font-size:15px;line-height:22px;font-weight: 70;'>
                                          <h1 style="text-align: center; line-height: 60px; padding-left: 0; margin:0">${subject}</h1>
                                          </div>
                                 
                                  
                                    </table>
                                    <table border='0' cellpadding='0' cellspacing='0' role='presentation' style='vertical-align:top;' width='100%'>
                                        <tr>
                                          <td align='center' style='font-size:0px;padding:10px 25px;word-break:break-word;'>
                                            <table border='0' cellpadding='0' cellspacing='0' role='presentation' style='border-collapse:collapse;border-spacing:0px;'>
                                              <tbody>
                                                <tr>
                                                  <td style='width:230px;'>
                                                    <a href='https://leadersbridge.s3.amazonaws.com/site-assets/logo.png' target='_blank'>
                                                    </a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                        
                                      </table>
                               
                                    <!--[if mso | IE]>
                    </td></tr></table>
                    <![endif]-->
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <!--[if mso | IE]>
                    </td></tr></table>
                    <![endif]-->
                          <!--[if mso | IE]>
                    <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:600px;" width="600"><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                    <![endif]-->
                          <div style='margin:0px auto;max-width:600px;'>
                            <table align='center' border='0' cellpadding='0' cellspacing='0' role='presentation' style='width:100%;'>
                              <tbody>
                                <tr>
                                  <td style='direction:ltr;font-size:0px;padding:20px 0;text-align:center;vertical-align:top;'>
                                    <!--[if mso | IE]>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:600px;">
                    <![endif]-->
                                    <div class='dys-column-per-100 outlook-group-fix' style='direction:ltr;display:inline-block;font-size:13px;text-align:left;vertical-align:top;width:100%;'>
                                      <table border='0' cellpadding='0' cellspacing='0' role='presentation' style='vertical-align:top;' width='100%'>
                                        <tr>
                                          <td  style='font-size:0px;padding:10px 25px;word-break:break-word;'>
                                            <div style='color:#000000;font-family:Open Sans, Arial, sans-serif;font-size:10px;line-height:22px;'>
                                            <p >Hi ${name}</p>
          
          
                                            <h3>Your query is :</h3>
          
                                            <p>${message}</p>     
          
          
                                             <h4>Our Customer Support Team will get back to you as soon as possible.</h4>
          
                                            <p>Regards</p>
                                            <p>LeaderBridge Team</p>
          
                                           
                                            </div>
          
                                            
                                            <div style='color:#000000;font-family:Open Sans, Arial, sans-serif;font-size:12px;line-height:12px;text-align:center;'>
          
                                              <p>If you have any questions, feel free message us at <a href="support@leaderbridge.com">support@leaderbridge.com.</a></p>
                                            <p>All rights reserved LeaderBridge® .  </p>
                                         
                                            <p style="display: flex;align-items: center;" ><img src="https://img.icons8.com/material-rounded/24/000000/facebook-new.png"/><a  target="_blank" href="https://m.facebook.com/leaderbridge/?ref=py_c">Facebook</a></p> 
                                            <p style="display: flex;align-items: center;" ><img src="https://img.icons8.com/material/24/000000/linkedin--v1.png"/><a  target="_blank" href="https://www.linkedin.com/company/leader-bridge">Linkedin</a></p>
                                            <p style="display: flex;align-items: center;"><img src="https://img.icons8.com/material-rounded/24/000000/instagram-new.png"/><a  target="_blank" href="https://www.instagram.com/leaderbridge1/">Instagram</a></p>
                                         </div>
                                       
                                          </td>
                                        </tr>
                                      </table>
                                    </div>
                                    <!--[if mso | IE]>
                    </td></tr></table>
                    <![endif]-->
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <!--[if mso | IE]>
                    </td></tr></table>
                    <![endif]-->
                        
                        </div>
                      </body>
                    </html>`,
        });
        // console.log("Message sent: %s", info.messageId);
        const Replayfiledtrue =
          await global.models.GLOBAL.CONTACT.findByIdAndUpdate(id, {
            reply: true,
            adminmessage: message,
            adminsubject: subject,
          });
        // // console.log("Replayfiledtrue", Replayfiledtrue);
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

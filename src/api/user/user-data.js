const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const utils = require("../../utils");
// User Registration
module.exports = exports = {
  // route validation
  validation: Joi.object({
    profileImage: Joi.string().allow(""),
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
      profileImage,
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
        const image = await utils.uploadBase(profileImage, findUser._id);
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
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: { fillForm },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
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

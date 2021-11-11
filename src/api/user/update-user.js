const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Get User by ID
module.exports = exports = {
  // route validation
  validation: Joi.object({
    name: Joi.string().allow(""),
    organizationName: Joi.string().allow(""),
    currentRole: Joi.string().allow(""),
    region: Joi.string().allow(""),
    organizationEmail: Joi.string().allow(""),
    linkedinProfile: Joi.string().allow(""),
    organizationWebsite: Joi.string().allow(""),
    otherLink: Joi.string().allow(""),
    subject: Joi.array().allow(""),
  }),

  handler: async (req, res) => {
    let { user } = req;

    console.log("user------->>", user);
    if (user.userType === enums.USER_TYPE.ADMIN) {
    }
    try {
      let {
        name,
        organizationName,
        currentRole,
        region,
        organizationEmail,
        linkedinProfile,
        organizationWebsite,
        otherLink,
        subject,
      } = req.body;
      let updateUser = await global.models.GLOBAL.USER.findByIdAndUpdate(
        { _id: user._id },
        {
          $set: {
            name: name,
            organizationName: organizationName,
            currentRole: currentRole,
            region: region,
            organizationEmail: organizationEmail,
            linkedinProfile: linkedinProfile,
            organizationWebsite: organizationWebsite,
            otherLink: otherLink,
            subject: subject,
            updatedAt: new Date(),
            updatedBy: user.email,
          },
        },
        { new: true }
      );

      if (!updateUser) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.USER_DOES_NOT_EXIST,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.NOT_FOUND)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_UPDATED,
          payload: { updateUser },
          logPayload: false,
        };
        res
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

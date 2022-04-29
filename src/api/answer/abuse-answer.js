const { ObjectID } = require("bson");
const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route validation
  validation: Joi.object({
    reason: Joi.string().required(),
  }),

  handler: async (req, res) => {
    const { user, answerId, reason } = req;

    const userData = await utils.getHeaderFromToken(user);

    try {
      if (answerId) {
        const reportAbuse = await global.models.GLOBAL.USER.findOneAndUpdate(
          {
            _id: userData.id,
          },
          {
            $addToSet: {
              abuseAnswer: {
                answerId: ObjectID(answerId),
                reason: reason,
              },
            },
          },
          { new: true }
        );
        if (reportAbuse) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: "Answer Reported successfully",
            payload: {},
            logPayload: false,
          };

          // res
          //   .status(enums.HTTP_CODES.OK)
          //   .json(utils.createResponseObject(data4createResponseObject));

          return data4createResponseObject;
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: "Somethings went wrong to report question",
            payload: {},
            logPayload: false,
          };
          return data4createResponseObject;
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
      return data4createResponseObject;
    }
  },
};

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add Answer
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { id } = req.params;
    if (!id) {
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
        _id: id,
      });
      //   console.log("USER--->>", findUser);
      if (findUser) {
        let newRequestObj = {
          requestBy: user._id,
          requestTo: id,
          createdAt: Date.now(),
        };
        let newRequest =
          await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.create(
            newRequestObj
          );
        if (newRequest) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: "Requested Successfully.",
            payload: { newRequest },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: "Sorry, Something went wrong to create new request.",
            payload: {},
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.BAD_REQUEST)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
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
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};

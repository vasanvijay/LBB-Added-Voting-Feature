const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Get User by ID
module.exports = exports = {
  handler: async (req, res) => {
    let { user } = req;
    let { userId } = req.query;
    console.log("user------->>", user);
    let criteria = {};
    if (user.userType === enums.USER_TYPE.USER) {
      criteria = {
        _id: user._id,
      };
    }
    if (user.userType === enums.USER_TYPE.ADMIN) {
      if (userId) {
        criteria = {
          _id: userId,
        };
      }
    }
    console.log("criteria---->", criteria);
    try {
      let findUser = await global.models.GLOBAL.USER.find(criteria);
      if (!findUser) {
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
        findUser = JSON.parse(JSON.stringify(findUser));
        delete findUser.password;
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.USER_FETCH_SUCCESS,
          payload: { findUser },
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

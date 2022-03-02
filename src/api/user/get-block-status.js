const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const { getHeaderFromToken } = require("../../utils");
const utils = require("../../utils");
// Retrieve and return all Block-user List from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user, userId } = req;
    const userData = await getHeaderFromToken(user);
    try {
      // console.log("vfdcxbcvbvcbcbcc", userId);
      if (userId) {
        let blockUser = await global.models.GLOBAL.USER.find({
          _id: userData.id,
          blockUser: userId,
        });
        blockUser = JSON.parse(JSON.stringify(blockUser));
        // console.log("CBVCBVCBCBC===================", blockUser.length);
        const data4createResponseObject = {
          // req: req,
          result: 0,
          message: messages.ITEM_FETCHED,
          payload: {
            isBlocked: blockUser.length ? true : false,
          },
          logPayload: false,
        };
        return data4createResponseObject;
      } else {
        const data4createResponseObject = {
          // req: req,
          result: -1,
          message: messages.INVALID_PARAMETERS,
          payload: {},
          logPayload: false,
        };
        return data4createResponseObject;
      }

      // res
      //   .status(enums.HTTP_CODES.OK)
      //   .json(utils.createResponseObject(data4createResponseObject));
    } catch (error) {
      // logger.error(
      //   `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
      // );
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.GENERAL,
        payload: { error: error.message },
        logPayload: false,
      };
      return data4createResponseObject;
      // res
      //   .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
      //   .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};

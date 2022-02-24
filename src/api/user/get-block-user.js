const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const { getHeaderFromToken } = require("../../utils");
const utils = require("../../utils");
// Retrieve and return all Block-user List from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const userData = await getHeaderFromToken(user);
    try {
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      let blockUser = await global.models.GLOBAL.USER.find({
        _id: userData.id,
      })
        .populate({
          path: "blockUser",
          model: "user",
          select: "_id email name currentRole subject profileImage",
        })
        .skip(skip)
        .limit(limit);
      if (blockUser) {
        blockUser = JSON.parse(JSON.stringify(blockUser));
        const data4createResponseObject = {
          // req: req,
          result: 0,
          message: messages.ITEM_FETCHED,
          payload: {
            blockUser: blockUser[0]?.blockUser,
            count: blockUser[0]?.blockUser.length,
            page,
            limit,
          },
          logPayload: false,
        };
        return data4createResponseObject;
        // res
        //   .status(enums.HTTP_CODES.OK)
        //   .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          // req: req,
          result: -1,
          message: messages.NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return data4createResponseObject;
        // res
        //   .status(enums.HTTP_CODES.NOT_FOUND)
        //   .json(utils.createResponseObject(data4createResponseObject));
      }
    } catch (error) {
      // logger.error(
      //   `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
      // );
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
      // res
      //   .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
      //   .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};

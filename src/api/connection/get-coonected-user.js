const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    try {
      let findConnection = await global.models.GLOBAL.USER.find({
        _id: user._id,
      }).populate({
        path: "accepted",
        model: "user",
        select: "_id name email profileImage region currentRole subject",
      });
      findConnection = JSON.parse(JSON.stringify(findConnection));
      console.log("findConnection----->>", findConnection);
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: {
          connection: findConnection[0]?.accepted,
        },
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
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

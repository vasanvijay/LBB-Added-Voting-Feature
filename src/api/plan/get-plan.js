const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all About Us from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { type } = req.query;
    let criteria;
    if (type) {
      criteria = { type: type };
    }
    try {
      let allPlan = await global.models.GLOBAL.PLAN.find(criteria);
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: { allPlan },
        logPayload: false,
      };
      return res
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
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};

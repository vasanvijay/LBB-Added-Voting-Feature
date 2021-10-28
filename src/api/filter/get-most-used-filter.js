const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Most Used Filter from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      let mostUsed = await global.models.GLOBAL.QUESTION.aggregate([
        {
          $group: {
            _id: {
              filter: "$filter._id",
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            "_id.filter": 1,
            count: -1,
          },
        },
        {
          $group: {
            _id: {
              filter: "$_id.filter",
            },
            name: {
              $first: "$_id.filter",
            },
            count: {
              $first: "$count",
            },
          },
        },
      ]);
      console.log("Filter--->", mostUsed);
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

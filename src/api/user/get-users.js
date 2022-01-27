const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");

// Retrieve and return all Question from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;

    if (user?.userType === "admin") {
      try {
        let alllUsers = await global.models.GLOBAL.USER.find({
          userType: "user",
        });

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.SUCCESS,
          payload: alllUsers,
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } catch (e) {
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
    } else {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.NOT_ALLOWED,
        payload: {},
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.UNAUTHORIZED)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    res.status(200).send({
      user: user,
    });
  },
};

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");

// Get User by ID
module.exports = exports = {
  handler: async (req, res) => {
    let { user } = req;
    let { userId } = req.query;
    let criteria = {};

    if (user.userType === enums.USER_TYPE.USER) {
      if (userId) {
        criteria = {
          _id: userId,
        };
      } else {
        criteria = {
          _id: user._id,
        };
      }
    }

    if (user.userType === enums.USER_TYPE.ADMIN) {
      if (!userId) {
        criteria = {
          userType: enums.USER_TYPE.USER,
        };
      }
      if (userId) {
        criteria = {
          _id: userId,
        };
      }
    }
    try {
      let findUser = await global.models.GLOBAL.USER.find(criteria)
        .sort({
          createdAt: -1,
        })
        .populate({
          path: "abuseQuestion.questionId",
          model: "question",
          select: "_id question",
        })
        .populate({
          path: "abuseAnswer.answerId",
          model: "answer",
          select: "_id answer",
        });
      let count = await global.models.GLOBAL.USER.count(criteria);

      let TodayUser = await global.models.GLOBAL.USER.find({
        createdAt: {
          $gte: moment(new Date()).format("YYYY-MM-DD"),
        },
      });
      const user = await global.models.GLOBAL.USER.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            users: { $sum: 1 },
          },
        },
      ]).sort({ _id: 1 });

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
          payload: {
            findUser,
            count,
            todaysCount: TodayUser.length,
            totalmonth: user,
          },
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

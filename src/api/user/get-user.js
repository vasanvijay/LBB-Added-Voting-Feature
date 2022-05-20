const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");
const { ObjectId } = require("mongodb");

// Get User by ID
module.exports = exports = {
  handler: async (req, res) => {
    let { user } = req;
    let { userId } = req.query;
    let criteria = {};
    console.log("user222222222222222111111111111111111111111111111", userId);

    let Usertype = await global.models.GLOBAL.USER.find({
      _id: ObjectId(userId),
    });

    console.log("Usertype111111111111122222", Usertype[0]?.userType);
    if (Usertype[0]?.userType === enums.USER_TYPE.USER) {
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

    if (Usertype[0]?.userType === enums.USER_TYPE.ADMIN) {
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

    console.log("criteria", criteria);
    try {
      let questionCount;
      let answerCount;
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

      console.log("findUser2122222222", findUser[0]);
      let count = await global.models.GLOBAL.USER.count(criteria);
      if (userId) {
        questionCount = await global.models.GLOBAL.QUESTION.count({
          createdBy: userId,
        });
        answerCount = await global.models.GLOBAL.ANSWER.count({
          createdBy: userId,
        });
      } else {
        questionCount = await global.models.GLOBAL.QUESTION.count({
          createdBy: user._id,
        });
        answerCount = await global.models.GLOBAL.ANSWER.count({
          createdBy: user._id,
        });
      }

      var today = new Date();
      var MonthEnd = today.getMonth();
      var Months = MonthEnd < 10 ? "0" + MonthEnd : MonthEnd;

      var DateFormate =
        today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
      var date = today.getFullYear() + "-" + Months + "-" + DateFormate;
      var TimeMent =
        today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
      var time = today.getHours() + ":" + TimeMent + ":" + today.getSeconds();
      var dateTime = date + " " + time;
      var rrrrr = date + "T" + time + "Z";

      let TodayUser = await global.models.GLOBAL.USER.find({
        createdAt: {
          $gte: new Date(today.getFullYear(), Months, DateFormate),
          // $gte: rrrrr,
        },
      });

      // convert to unix time to format utc time after code uncomment

      // const users = await global.models.GLOBAL.USER.aggregate([
      //   {
      //     $group: {
      //       _id: { $month: "$createdAt" },
      //       users: { $sum: 1 },
      //     },
      //   },
      // ]).sort({ _id: 1 });

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
            questionCount,
            answerCount,
            count,
            todaysCount: TodayUser.length,
            totalmonth: users,
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

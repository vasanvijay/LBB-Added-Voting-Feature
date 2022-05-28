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

      const users = await global.models.GLOBAL.USER.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            users: { $sum: 1 },
          },
        },
      ]).sort({ _id: 1 });

      for (let i = 0; i < users?.length; i++) {
        // if (users[i]?._id == new Date().getMonth() + 1) {
        //   users.splice(i, 1);
        // }

        if (users[i]?._id === 1) {
          users[i]._id = "Jan";
        }
        if (users[i]?._id === 2) {
          users[i]._id = "Fab";
        }

        if (users[i]?._id === 3) {
          users[i]._id = "Mar";
        }

        if (users[i]?._id === 4) {
          users[i]._id = "Apr";
        }

        if (users[i]?._id === 5) {
          users[i]._id = "May";
        }

        if (users[i]?._id === 6) {
          users[i]._id = "Jun";
        }

        if (users[i]?._id === 7) {
          users[i]._id = "Jul";
        }

        if (users[i]?._id === 8) {
          users[i]._id = "Aug";
        }

        if (users[i]?._id === 9) {
          users[i]._id = "Sep";
        }

        if (users[i]?._id === 10) {
          users[i]._id = "Oct";
        }

        if (users[i]?._id === 11) {
          users[i]._id = "Nov";
        }

        if (users[i]?._id === 12) {
          users[i]._id = "Dec";
        }

        console.log("datasheet", users[i]?._id);
        // settotalMonthName(totalmonth[i]?._id)
      }

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

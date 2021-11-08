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
    const { question } = req.query;
    const { byUser } = req.query;
    let criteria = {};
    if (byUser) {
      criteria = {
        createdBy: user._id,
      };
      if (question) {
        criteria = {
          _id: question,
          createdBy: user._id,
        };
      }
    }
    if (question) {
      criteria = {
        _id: question,
      };
    }
    console.log("Criteria---->", criteria);
    const { filter } = req.body;
    try {
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      let question = await global.models.GLOBAL.QUESTION.find(criteria)
        .populate({
          path: "createdBy",
          model: "user",
          select: "name",
        })
        .skip(skip)
        .limit(limit);
      console.log("useruser", user.accepted);
      let findConection = await global.models.GLOBAL.QUESTION.find({
        senderId: user._id,
      });
      const pandingIdExist = (id) => {
        return findConection.length
          ? findConection.receiverId.some(function (el) {
              return el.toString() === id.toString();
            })
          : false;
      };
      const conectIdExist = (id) => {
        return user.accepted.length
          ? user.accepted.some(function (el) {
              return el.toString() === id.toString();
            })
          : false;
      };
      let questionDetais = [];
      for (let i = 0; i < question.length; i++) {
        console.log("question.length---->>", i);
        console.log("Id--->", question[i]);
        if (conectIdExist(question[i].createdBy?._id)) {
          console.log("Id--->", question[i].createdBy?._id);
          const questionDetaisObj = {
            _id: question[i]._id,
            displayProfile: question[i].displayProfile,
            allowConnectionRequest: question[i].allowConnectionRequest,
            view: question[i].view,
            response: question[i].response,
            status: question[i].status,
            question: question[i].question,
            filter: question[i].filter,
            createdAt: question[i].createdAt,
            createdBy: question[i].createdBy,
            isFriend: true,
          };
          questionDetais.push(questionDetaisObj);
        } else if (pandingIdExist(question[i].createdBy?._id)) {
          console.log("Id--->", question[i].createdBy?._id);
          const questionDetaisObj = {
            _id: question[i]._id,
            displayProfile: question[i].displayProfile,
            allowConnectionRequest: question[i].allowConnectionRequest,
            view: question[i].view,
            response: question[i].response,
            status: question[i].status,
            question: question[i].question,
            filter: question[i].filter,
            createdAt: question[i].createdAt,
            createdBy: question[i].createdBy,
            isFriend: panding,
          };
          questionDetais.push(questionDetaisObj);
        } else {
          console.log("Id--->", question[i].createdBy?._id);
          const questionDetaisObj = {
            _id: question[i]._id,
            displayProfile: question[i].displayProfile,
            allowConnectionRequest: question[i].allowConnectionRequest,
            view: question[i].view,
            response: question[i].response,
            status: question[i].status,
            question: question[i].question,
            filter: question[i].filter,
            createdAt: question[i].createdAt,
            createdBy: question[i].createdBy,
            isFriend: false,
          };
          questionDetais.push(questionDetaisObj);
        }
      }
      // today's Questions Count
      let TodayQuestion = await global.models.GLOBAL.QUESTION.find({
        createdAt: {
          $gte: moment(new Date()).format("YYYY-MM-DD"),
        },
      });

      //Questions Profile access
      let QuestionProfileAccess = await global.models.GLOBAL.QUESTION.find({
        criteria,
        displayProfile: true,
      });

      // Questions without profile Access
      let QuestionProfileWithoutAccess =
        await global.models.GLOBAL.QUESTION.find({
          displayProfile: false,
        });

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: {
          questionDetais,
          count: question.length,
          todaysCount: TodayQuestion.length,
          profileaccess: QuestionProfileAccess.length,
          withoutprofileaccess: QuestionProfileWithoutAccess.length,
          page,
          limit,
        },
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
      if (filter) {
        console.log(
          "Filter--->",
          await global.models.GLOBAL.QUESTION.find(
            { criteria },
            { filter: { $in: { filterId: [...filter] } } }
          )
        );
        req.query.page = req.query.page ? req.query.page : 1;
        let page = parseInt(req.query.page);
        req.query.limit = req.query.limit ? req.query.limit : 10;
        let limit = parseInt(req.query.limit);
        let skip = (parseInt(req.query.page) - 1) * limit;
        let question = await global.models.GLOBAL.QUESTION.find(
          { criteria },
          { filter: { $in: { filterId: [...filter] } } }
        )
          .populate({
            path: "createdBy",
            model: "user",
            select: "name",
          })
          .skip(skip)
          .limit(limit);

        console.log("Question by filter---->", question);
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.SUCCESS,
          payload: {
            question,
            count: question.length,
            page,
            limit,
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

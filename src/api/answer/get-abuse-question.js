const { ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  handler: async (req, res) => {
    const { questionId, searchTerm, searchUser } = req.query;
    let questionExists = {};

    // console.log("questionId###########", questionId);
    if (questionId) {
      questionExists = await global.models.GLOBAL.ANSWER.findById(questionId);
      if (!questionExists) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return res.status(enums.HTTP_CODES.BAD_REQUEST).json(utils.createResponseObject(data4createResponseObject));
      }
    }
    // console.log("questionExists", questionExists);
    // console.log("questionExists", searchTerm);
    try {
      if (questionId === undefined) {
        const getReportAbuse = await global.models.GLOBAL.USER.find({}).populate({
          path: "abuseAnswer.answerId",
          model: "answer",
          select: "_id isUpdated isAbuse isStar status answer question",
          populate: {
            path: "question",
            model: "question",
            select: "_id question response",
          },
        });

        let reportedQuestions = [];
        let users = [];

        getReportAbuse.forEach((user) => {
          if (user.abuseAnswer.length > 0) {
            users.push(user);
            user.abuseAnswer.forEach((question) => {
              // console.log("currQuestion", question.answerId);
              if (question.answerId) {
                reportedQuestions.push(question);
              }
            });
          }
        });
        // Get all question ids

        // console.log("reportedQuestions", reportedQuestions);
        const ids = reportedQuestions.map((o) => o?.questionId?._id);
        // remove repeated questions from reportedQuestions array
        // reportedQuestions = reportedQuestions.filter(
        //   ({ questionId }, index) => !ids.includes(questionId?._id, index + 1)
        // );

        if (searchTerm != undefined) {
          reportedQuestions = reportedQuestions.filter((question) => question.questionId.question.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // // populate question createdBy
        // let questions = [];
        // for (let i = 0; i < reportedQuestions.length; i++) {
        //   const findUser = await global.models.GLOBAL.USER.findById(reportedQuestions[i]?.questionId?.createdBy);
        //   console.log("findUserrr", findUser)
        //   if(reportedQuestions[i]?.questionId?._id){
        //     let questionObj = {
        //       questionId: reportedQuestions[i]?.questionId?._id,
        //       question: reportedQuestions[i]?.questionId?.question,
        //       response: reportedQuestions[i]?.questionId?.response,
        //       view: reportedQuestions[i]?.questionId?.view,
        //       createdBy: {
        //         _id: findUser?._id,
        //         name: findUser?.name,
        //         profileImage: findUser?.profileImage
        //       },
        //     }
        //     questions.push(questionObj);
        //   }
        // }
        if (getReportAbuse) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: { reportedQuestions, users },
            logPayload: false,
          };
          res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: "Somethings went wrong to get reported question",
            payload: {},
            logPayload: false,
          };
          res.status(enums.HTTP_CODES.BAD_REQUEST).json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        const getReportAbuse = await global.models.GLOBAL.USER.find({
          "abuseAnswer.answerId": ObjectId(questionId),
        }).populate({
          path: "abuseAnswer.answerId",
          model: "answer",
          select: "_id question response view createdBy",
        });

        // console.log("questionID is heree", getReportAbuse)
        let reportedQuestions = [];
        let users = [];
        getReportAbuse.forEach((user) => {
          if (user.abuseQuestion.length > 0) {
            let userObj = {
              _id: user?._id,
              name: user?.name,
              profileImage: user?.profileImage,
              email: user?.email,
              region: user?.region,
            };
            users.push(userObj);
            user.abuseQuestion.forEach((question) => {
              reportedQuestions.push(question);
            });
          }
        });

        if (searchUser != undefined) {
          users = users.filter((user) => user.name.toLowerCase().includes(searchUser.toLowerCase()));
        }
        if (getReportAbuse) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: { users },
            logPayload: false,
          };
          res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: "Somethings went wrong to get reported question",
            payload: {},
            logPayload: false,
          };
          res.status(enums.HTTP_CODES.BAD_REQUEST).json(utils.createResponseObject(data4createResponseObject));
        }
      }
    } catch (error) {
      logger.error(`${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`);
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      res.status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(utils.createResponseObject(data4createResponseObject));
    }
  },
};

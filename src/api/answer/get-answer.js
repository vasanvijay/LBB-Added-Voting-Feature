const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { answerByMe } = req.query;
    const { question } = req.query;
    let criteria = {};
    if (answerByMe) {
      criteria = {
        answerBy: user._id,
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
    try {
      let Answer = [];
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      let answer = await global.models.GLOBAL.ANSWER.find(criteria)
        .populate({
          path: "question",
          model: "question",
          select:
            "_id question response filter status view displayProfile createdAt createdBy",
        })
        .skip(skip)
        .limit(limit);
      console.log("answer---->>>", answer);
      if (answer) {
        let findConection = await global.models.GLOBAL.CONNECTION.find({
          senderId: user._id,
        });

        let pandingConnection = await global.models.GLOBAL.CONNECTION.find({
          receiverId: user._id,
        });
        const conectIdExist = (id) => {
          console.log("ID--->>", id);

          return user.accepted.length
            ? user.accepted.some(function (el) {
                return el.toString() == id.toString();
              })
            : false;
        };

        const sentIdExist = (id) => {
          let check = findConection.filter(function (elc) {
            return elc.receiverId.toString() === id.toString();
          });
          return check.length;
        };

        const pandingIdExist = (id) => {
          let panding = pandingConnection.filter(function (elf) {
            return elf.senderId.toString() === id.toString();
          });
          console.log("length---->", panding.length);
          return panding.length;
        };
        for (let i = 0; i < answer.length; i++) {
          console.log("IN FOR---->");
          if (conectIdExist(answer[i].question?.createdBy)) {
            console.log("IN IF----->>>", answer[i].question?.createdBy);
            let answerObj = {
              _id: answer[i].question._id,
              displayProfile: answer[i].question.displayProfile,
              view: answer[i].question.view,
              response: answer[i].question.response,
              status: answer[i].question.status,
              question_id: answer[i].question._id,
              question: answer[i].question.question,
              answer: answer[i].answer,
              filter: answer[i].question.filter,
              createdAt: answer[i].question.createdAt,
              createdBy: answer[i].question.createdBy,
              answerBy: answer[i].answerBy,
              updated: answer[i].updated,
              isFriend: "true",
            };
            Answer.push(answerObj);
          } else if (sentIdExist(answer[i].question?.createdBy)) {
            console.log("IN ELSE IF 1 -------> ");
            let answerObj = {
              _id: answer[i].question._id,
              displayProfile: answer[i].question.displayProfile,
              view: answer[i].question.view,
              response: answer[i].question.response,
              status: answer[i].question.status,
              question_id: answer[i].question._id,
              question: answer[i].question.question,
              answer: answer[i].answer,
              filter: answer[i].question.filter,
              createdAt: answer[i].question.createdAt,
              createdBy: answer[i].question.createdBy,
              answerBy: answer[i].answerBy,
              updated: answer[i].updated,
              isFriend: "sent",
            };
            Answer.push(answerObj);
          } else if (pandingIdExist(answer[i].question?.createdBy)) {
            console.log("IN ELSE IF 2 -------> ");
            let answerObj = {
              _id: answer[i].question._id,
              displayProfile: answer[i].question.displayProfile,
              view: answer[i].question.view,
              response: answer[i].question.response,
              status: answer[i].question.status,
              question_id: answer[i].question._id,
              question: answer[i].question.question,
              answer: answer[i].answer,
              filter: answer[i].question.filter,
              createdAt: answer[i].question.createdAt,
              createdBy: answer[i].question.createdBy,
              answerBy: answer[i].answerBy,
              updated: answer[i].updated,
              isFriend: "pending",
            };
            Answer.push(answerObj);
          } else {
            let answerObj = {
              _id: answer[i].question._id,
              displayProfile: answer[i].question.displayProfile,
              view: answer[i].question.view,
              response: answer[i].question.response,
              status: answer[i].question.status,
              question_id: answer[i].question._id,
              question: answer[i].question.question,
              answer: answer[i].answer,
              filter: answer[i].question.filter,
              createdAt: answer[i].question.createdAt,
              createdBy: answer[i].question.createdBy,
              answerBy: answer[i].answerBy,
              updated: answer[i].updated,
              isFriend: "false",
            };
            Answer.push(answerObj);
          }
        }

        Answer = JSON.parse(JSON.stringify(Answer));
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.SUCCESS,
          payload: {
            questions: Answer,
            count: Answer.length,
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

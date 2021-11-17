const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { search } = req.query;
    let Question = [];
    try {
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      let question = await global.models.GLOBAL.USER.find({ _id: user._id })
        .populate({
          path: "answerLater",
          model: "question",
          select:
            "_id question response filter status view displayProfile createdAt createdBy",
        })
        .skip(skip)
        .limit(limit);
      // console.log("question----->>>", question);
      console.log("QUESTION", question[0]?.answerLater);
      if (question) {
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
        for (let i = 0; i < question[0]?.answerLater.length; i++) {
          console.log("IN FOR---->");
          if (conectIdExist(question[0]?.answerLater[i].createdBy?._id)) {
            console.log("IN IF----->>>");
            let questionObj = {
              _id: question[0]?.answerLater[i]._id,
              displayProfile: question[0]?.answerLater[i].displayProfile,
              view: question[0]?.answerLater[i].view,
              response: question[0]?.answerLater[i].response,
              status: question[0]?.answerLater[i].status,
              question: question[0]?.answerLater[i].question,
              filter: question[0]?.answerLater[i].filter,
              createdAt: question[0]?.answerLater[i].createdAt,
              createdBy: question[0]?.answerLater[i].createdBy,
              isFriend: "true",
            };
            Question.push(questionObj);
          } else if (sentIdExist(question[0]?.answerLater[i].createdBy?._id)) {
            console.log("IN ELSE IF 1 -------> ");
            const connect = findConection.filter((connection) => {
              if (
                connection?.senderId.toString() ==
                question[0]?.answerLater[i].createdBy?._id.toString()
              ) {
                return connection;
              }
            });
            let questionObj = {
              _id: question[0]?.answerLater[i]._id,
              displayProfile: question[0]?.answerLater[i].displayProfile,
              view: question[0]?.answerLater[i].view,
              response: question[0]?.answerLater[i].response,
              status: question[0]?.answerLater[i].status,
              question: question[0]?.answerLater[i].question,
              filter: question[0]?.answerLater[i].filter,
              createdAt: question[0]?.answerLater[i].createdAt,
              createdBy: question[0]?.answerLater[i].createdBy,
              isFriend: "sent",
            };
            Question.push(questionObj);
          } else if (
            pandingIdExist(question[0]?.answerLater[i].createdBy?._id)
          ) {
            console.log("IN ELSE IF 2 -------> ");
            const connect = pandingConnection.filter((connection) => {
              if (
                connection?.senderId.toString() ==
                question[0]?.answerLater[i].createdBy?._id.toString()
              ) {
                return connection;
              }
            });
            let questionObj = {
              _id: question[0]?.answerLater[i]._id,
              displayProfile: question[0]?.answerLater[i].displayProfile,
              view: question[0]?.answerLater[i].view,
              response: question[0]?.answerLater[i].response,
              status: question[0]?.answerLater[i].status,
              question: question[0]?.answerLater[i].question,
              filter: question[0]?.answerLater[i].filter,
              createdAt: question[0]?.answerLater[i].createdAt,
              createdBy: question[0]?.answerLater[i].createdBy,
              isFriend: "pending",
            };
            Question.push(questionObj);
          } else {
            let questionObj = {
              _id: question[0]?.answerLater[i]._id,
              displayProfile: question[0]?.answerLater[i].displayProfile,
              view: question[0]?.answerLater[i].view,
              response: question[0]?.answerLater[i].response,
              status: question[0]?.answerLater[i].status,
              question: question[0]?.answerLater[i].question,
              filter: question[0]?.answerLater[i].filter,
              createdAt: question[0]?.answerLater[i].createdAt,
              createdBy: question[0]?.answerLater[i].createdBy,
              isFriend: "false",
            };
            Question.push(questionObj);
          }
        }
        console.log("QUESTION----->>>>", Question);
        Question = JSON.parse(JSON.stringify(Question));
        if (search) {
          let abcd = question[0]?.answerLater.filter((question) => {
            if (question.question.search(search) > 0) {
              return question;
            }
          });
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: {
              questions: abcd,
              count: abcd.length,
              page,
              limit,
            },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: {
              questions: Question,
              count: Question.length,
              page,
              limit,
            },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.NOT_FOUND)
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

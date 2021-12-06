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

    try {
      let Answers = [];
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      let questionArray = await global.models.GLOBAL.ANSWER.find().distinct(
        "question",
        { $and: [{ answerBy: user._id }] }
      );
      let optionNames = [];
      let reachCount = async (question) => {
        for (let k = 0; k < question.filter.length; k++) {
          question.filter[k]?.options.map(async (item) => {
            optionNames.push(item.optionName);
          });
        }

        const users = await global.models.GLOBAL.USER.find({
          $text: { $search: optionNames.join(" ") },
        })
          .count()
          .then((ress) => ress);
        if (users == 0) {
          return await global.models.GLOBAL.USER.count();
        } else {
          return users;
        }
      };
      let answer = [];
      for (let i = 0; i < questionArray.length; i++) {
        let ans = await global.models.GLOBAL.QUESTION.findOne({
          _id: questionArray[i],
        }).populate({
          path: "createdBy",
          model: "user",
          select: "_id name subject profileImage currentRole",
        });
        answer.push(ans);
      }

      if (answer) {
        let findConection = await global.models.GLOBAL.CONNECTION.find({
          senderId: user._id,
        });

        let pandingConnection = await global.models.GLOBAL.CONNECTION.find({
          receiverId: user._id,
        });
        const conectIdExist = (id) => {
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
          return panding.length;
        };
        for (let i = 0; i < answer.length; i++) {
          if (conectIdExist(answer[i]?.createdBy)) {
            let answerObj = {
              _id: answer[i]._id,
              displayProfile: answer[i].displayProfile,
              allowConnectionRequest: answer[i].allowConnectionRequest,
              view: answer[i].view,
              response: answer[i].response,
              reaches: answer[i].reaches,
              status: answer[i].status,
              question: answer[i].question,
              filter: answer[i].filter,
              createdAt: answer[i].createdAt,
              createdBy: answer[i].createdBy,
              isFriend: "true",
              reach: await reachCount(answer[i]),
            };
            Answers.push(answerObj);
          } else if (sentIdExist(answer[i]?.createdBy)) {
            let answerObj = {
              _id: answer[i]._id,
              displayProfile: answer[i].displayProfile,
              allowConnectionRequest: answer[i].allowConnectionRequest,
              view: answer[i].view,
              response: answer[i].response,
              reaches: answer[i].reaches,
              status: answer[i].status,
              question: answer[i].question,
              filter: answer[i].filter,
              createdAt: answer[i].createdAt,
              createdBy: answer[i].createdBy,
              isFriend: "sent",
              reach: await reachCount(answer[i]),
            };
            Answers.push(answerObj);
          } else if (pandingIdExist(answer[i]?.createdBy)) {
            let answerObj = {
              _id: answer[i]._id,
              displayProfile: answer[i].displayProfile,
              allowConnectionRequest: answer[i].allowConnectionRequest,
              view: answer[i].view,
              response: answer[i].response,
              reaches: answer[i].reaches,
              status: answer[i].status,
              question: answer[i].question,
              filter: answer[i].filter,
              createdAt: answer[i].createdAt,
              createdBy: answer[i].createdBy,
              isFriend: "pending",
              reach: await reachCount(answer[i]),
            };
            Answers.push(answerObj);
          } else {
            let answerObj = {
              _id: answer[i]._id,
              displayProfile: answer[i].displayProfile,
              allowConnectionRequest: answer[i].allowConnectionRequest,
              view: answer[i].view,
              response: answer[i].response,
              reaches: answer[i].reaches,
              status: answer[i].status,
              question: answer[i].question,
              filter: answer[i].filter,
              createdAt: answer[i].createdAt,
              createdBy: answer[i].createdBy,
              isFriend: "false",
              reach: await reachCount(answer[i]),
            };
            Answers.push(answerObj);
          }
        }

        Answers = JSON.parse(JSON.stringify(Answers));
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.SUCCESS,
          payload: {
            questions: Answers,
            count: Answers.length,
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

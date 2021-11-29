const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Question from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { question } = req.query;
    const { byUser } = req.query;
    const { search } = req.query;
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
    try {
      const { filter } = req.body;
      let distinctQue;
      const QuestionsArray = [];
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      if (filter) {
        let Questions = [];
        if (search) {
          for (let i = 0; i < filter.length; i++) {
            if (filter[i] != "") {
              let quResult = await global.models.GLOBAL.QUESTION.find({
                ...criteria,
                question: { $regex: search, $options: "i" },
                $and: [
                  { _id: { $nin: user.answerLater } },
                  // { _id: { $nin: user.abuseQuestion } },
                  { createdBy: { $nin: user.blockUser } },
                  { "filter.options.optionName": filter[i] },
                  { reportAbuse: { $nin: true } },
                ],
              })
                // .populate({
                //   path: "filter.filterId",
                //   populate: {
                //     path: "options",
                //     model: "filter",
                //     select: "_id",
                //   },
                //   model: "filter",
                //   select: "_id name",
                // })
                .skip(skip)
                .limit(limit)
                .exec();

              for (let j = 0; j < quResult.length; j++) {
                if (quResult[i] != null) {
                  Questions.push(quResult[i]);
                }
              }
            }
          }
          distinctQue = Array.from(new Set(Questions.map((q) => q._id))).map(
            (id) => {
              return {
                _id: id,
                question: Questions.find((aid) => aid._id === id).question,
                view: Questions.find((aid) => aid._id === id).view,
                response: Questions.find((aid) => aid._id === id).response,
                status: Questions.find((aid) => aid._id === id).status,
                filter: Questions.find((aid) => aid._id === id).filter,
                createdAt: Questions.find((aid) => aid._id === id).createdAt,
                createdBy: Questions.find((aid) => aid._id === id).createdBy,
              };
            }
          );
        } else if (!byUser) {
          for (let i = 0; i < filter.length; i++) {
            if (filter[i] != "") {
              let quResult = await global.models.GLOBAL.QUESTION.find({
                ...criteria,
                // createdBy: { $not: { $eq: user._id } },
                $and: [
                  { _id: { $nin: user.answerLater } },
                  { "filter.options.optionName": filter[i] },
                  { _id: { $nin: user.removeQuestion } },
                  // { _id: { $nin: user.abuseQuestion } },
                  { createdBy: { $nin: user.blockUser } },
                  { reportAbuse: { $nin: true } },
                  //   { createdBy: { $nin: user._id } },
                ],
              })
                // .populate({
                //   path: "filter.filterId",
                //   populate: {
                //     path: "options",
                //     model: "filter",
                //     select: "_id",
                //   },
                //   model: "filter",
                //   select: "_id name",
                // })
                .skip(skip)
                .limit(limit)
                .exec();
              for (let j = 0; j < quResult.length; j++) {
                if (quResult[i] != null) {
                  Questions.push(quResult[i]);
                }
              }
            }
          }
          distinctQue = Array.from(new Set(Questions.map((q) => q._id))).map(
            (id) => {
              return {
                _id: id,
                question: Questions.find((aid) => aid._id === id).question,
                view: Questions.find((aid) => aid._id === id).view,
                response: Questions.find((aid) => aid._id === id).response,
                status: Questions.find((aid) => aid._id === id).status,
                filter: Questions.find((aid) => aid._id === id).filter,
                createdAt: Questions.find((aid) => aid._id === id).createdAt,
                createdBy: Questions.find((aid) => aid._id === id).createdBy,
              };
            }
          );
        } else {
          for (let i = 0; i < filter.length; i++) {
            if (filter[i] != "") {
              let quResult = await global.models.GLOBAL.QUESTION.find({
                ...criteria,
                $and: [
                  { _id: { $nin: user.answerLater } },
                  { "filter.options.optionName": filter[i] },
                  { _id: { $nin: user.removeQuestion } },
                  // { _id: { $nin: user.abuseQuestion } },
                  { createdBy: { $nin: user.blockUser } },
                  { reportAbuse: { $nin: true } },
                ],
              })
                // .populate({
                //   path: "filter.filterId",
                //   populate: {
                //     path: "options",
                //     model: "filter",
                //     select: "_id",
                //   },
                //   model: "filter",
                //   select: "_id name",
                // })
                .skip(skip)
                .limit(limit)
                .exec();

              for (let j = 0; j < quResult.length; j++) {
                if (quResult[i] != null) {
                  Questions.push(quResult[i]);
                }
              }
            }
          }
          distinctQue = Array.from(new Set(Questions.map((q) => q._id))).map(
            (id) => {
              return {
                _id: id,
                question: Questions.find((aid) => aid._id === id).question,
                view: Questions.find((aid) => aid._id === id).view,
                response: Questions.find((aid) => aid._id === id).response,
                status: Questions.find((aid) => aid._id === id).status,
                filter: Questions.find((aid) => aid._id === id).filter,
                createdAt: Questions.find((aid) => aid._id === id).createdAt,
                createdBy: Questions.find((aid) => aid._id === id).createdBy,
              };
            }
          );
        }
        // Questions.map((quest, i) => {
        //   return quest?.filter.map((filt, j) => {
        //     return filt?.options.map(async (opt, k) => {
        //       return filt?.filterId?.options?.filter((o) => {
        //         if (o._id.toString() === opt._id.toString()) {
        //           allQuestion = [
        //             ...Questions,
        //             (Questions[i].filter[j].options[k] = o),
        //           ];
        //         }
        //       });
        //     });
        //   });
        // });
        // let distinctQue = [...new Set(Questions.map((q) => q._id))];

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

        for (let i = 0; i < distinctQue.length; i++) {
          if (conectIdExist(distinctQue[i]._id)) {
            let questionObj = {
              question: distinctQue[i],
              isFriend: "true",
            };
            QuestionsArray.push(questionObj);
          } else if (sentIdExist(distinctQue[i]._id)) {
            let questionObj = {
              question: distinctQue[i],
              isFriend: "sent",
            };
            QuestionsArray.push(questionObj);
          } else if (pandingIdExist(distinctQue[i]._id)) {
            let questionObj = {
              question: distinctQue[i],
              isFriend: "pending",
            };
            QuestionsArray.push(questionObj);
          } else {
            let questionObj = {
              question: distinctQue[i],
              isFriend: "false",
            };
            QuestionsArray.push(questionObj);
          }
        }
      } else {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.INVALID_PARAMETERS,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: {
          questions: distinctQue,
          count: distinctQue.length,
          page,
          limit,
        },
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
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

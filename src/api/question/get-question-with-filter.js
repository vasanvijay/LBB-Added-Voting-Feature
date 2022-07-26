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
    let criteria;
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
      let abuseQuestion = [];
      const { filter } = req.body;
      // console.log("11111111111111111", filter);
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
          // console.log("@@@@@@@@@@@@@@", search);
          for (let i = 0; i < filter.length; i++) {
            if (filter[i] != "") {
              abuseQuestion = [];
              for (let j = 0; j < user.abuseQuestion.length; j++) {
                abuseQuestion.push(user.abuseQuestion[j].questionId);
              }
              // // console.log("Criteria ni moj", criteria);
              let qids = await global.models.GLOBAL.QUESTION.aggregate([
                {
                  $lookup: {
                    from: "user",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "user",
                  },
                },
                {
                  $match: {
                    "user.currentRole": filter[i],
                  },
                },
                // {
                //   $match: {
                //     "user.currentRole": {
                //       $regex: filter[i],
                //       $options: "i",
                //     },
                //   },
                // },
                {
                  $group: {
                    _id: "createdBy",
                    createdBy: {
                      $push: "$_id",
                    },
                  },
                },
              ]);

              // console.log("qids", qids);

              let quResult = await global.models.GLOBAL.QUESTION.find({
                ...criteria,
                question: { $regex: search, $options: "i" },
                $and: [
                  { _id: { $nin: user.answerLater } },
                  { _id: { $nin: abuseQuestion } },
                  { _id: user._id },
                  { createdBy: { $nin: user.blockUser } },
                  // { "filter.options.optionName": filter[i] },
                  { reportAbuse: { $nin: true } },
                  { _id: { $in: qids[0]?.createdBy } },
                ],
              })
                .populate({
                  path: "createdBy",
                  model: "user",
                  select: "_id name subject profileImage currentRole",
                })
                .skip(skip)
                .limit(limit)
                .sort({
                  createdAt: -1,
                })
                .exec();

              for (let j = 0; j < quResult.length; j++) {
                if (quResult[j] != null) {
                  //add if already not in array
                  let found = Questions.find((q) => q._id.toString() == quResult[j]._id.toString());
                  // console.log("---hgffgfg", found);
                  if (found == null) {
                    Questions.push(quResult[j]);
                  }
                }
              }
            }
          }
          distinctQue = Array.from(new Set(Questions.map((q) => q._id))).map((id) => {
            return {
              _id: id,
              question: Questions.find((aid) => aid._id === id).question,
              allowConnectionRequest: Questions.find((aid) => aid._id === id).allowConnectionRequest,
              displayProfile: Questions.find((aid) => aid._id === id).displayProfile,
              view: Questions.find((aid) => aid._id === id).view,
              response: Questions.find((aid) => aid._id === id).response,
              status: Questions.find((aid) => aid._id === id).status,
              filter: Questions.find((aid) => aid._id === id).filter,
              createdAt: Questions.find((aid) => aid._id === id).createdAt,
              createdBy: Questions.find((aid) => aid._id === id).createdBy,
            };
          });
        } else if (!byUser) {
          // console.log("111111111111", byUser);

          abuseQuestion = [];
          for (let j = 0; j < user.abuseQuestion.length; j++) {
            abuseQuestion.push(user.abuseQuestion[j].questionId);
          }
          for (let i = 0; i < filter.length; i++) {
            if (filter[i] != "") {
              let qids = await global.models.GLOBAL.QUESTION.aggregate([
                {
                  $lookup: {
                    from: "user",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "user",
                  },
                },
                {
                  $match: {
                    "user.currentRole": filter[i],
                  },
                },
                // {
                //   $match: {
                //     "user.currentRole": {
                //       $regex: filter[i],
                //       $options: "i",
                //     },
                //   },
                // },
                {
                  $group: {
                    _id: "createdBy",
                    createdBy: {
                      $push: "$_id",
                    },
                  },
                },
              ]);

              // console.log("qids@@@@@@@", qids);
              // // console.log("criteria ni", criteria);
              let quResult = await global.models.GLOBAL.QUESTION.find({
                // $and: [
                $and: [
                  { _id: { $nin: user.answerLater } },
                  { _id: { $nin: user.removeQuestion } },
                  { _id: { $nin: abuseQuestion } },
                  { createdBy: { $nin: user.blockUser } },
                  { createdBy: { $nin: user._id } },
                  { reportAbuse: { $nin: true } },
                  // { "filter.options.optionName": filter[i] },
                  { _id: { $in: qids[0]?.createdBy } },
                ],
                ...criteria,
              })
                .populate({
                  path: "createdBy",
                  model: "user",
                  select: "_id name subject profileImage currentRole",
                })
                .exec();

              // console.log("quResult@@@@@", quResult);

              for (let j = 0; j < quResult.length; j++) {
                if (quResult[j] != null) {
                  //add if already not in array
                  let found = Questions.find((q) => q._id.toString() == quResult[j]._id.toString());
                  // console.log("---hgffgfg", found);
                  if (found == null) {
                    Questions.push(quResult[j]);
                  }
                }
              }
            }
          }
          Questions = new Set(Questions);
          //set to array
          Questions = Array.from(Questions);
          // console.log("Questions------------------------", Questions);
          distinctQue = Array.from(new Set(Questions.map((q) => q._id))).map((id) => {
            return {
              _id: id,
              question: Questions.find((aid) => aid._id === id).question,
              allowConnectionRequest: Questions.find((aid) => aid._id === id).allowConnectionRequest,
              displayProfile: Questions.find((aid) => aid._id === id).displayProfile,
              view: Questions.find((aid) => aid._id === id).view,
              response: Questions.find((aid) => aid._id === id).response,
              status: Questions.find((aid) => aid._id === id).status,
              filter: Questions.find((aid) => aid._id === id).filter,
              createdAt: Questions.find((aid) => aid._id === id).createdAt,
              createdBy: Questions.find((aid) => aid._id === id).createdBy,
            };
          });
        } else {
          abuseQuestion = [];
          for (let j = 0; j < user.abuseQuestion.length; j++) {
            abuseQuestion.push(user.abuseQuestion[j].questionId);
          }

          for (let i = 0; i < filter.length; i++) {
            if (filter[i] != "") {
              // // console.log("criteria ni", criteria);
              let quResult = await global.models.GLOBAL.QUESTION.find({
                $and: [{ _id: { $nin: user.answerLater } }, { _id: { $nin: user.removeQuestion } }, { _id: { $nin: abuseQuestion } }, { createdBy: { $nin: user.blockUser } }, { createdBy: user._id }, { reportAbuse: { $nin: true } }, { "filter.options.optionName": filter[i] }],
              })
                .populate({
                  path: "createdBy",
                  model: "user",
                  select: "_id name subject profileImage currentRole",
                })
                .skip(skip)
                .limit(limit)
                .sort({
                  createdAt: -1,
                })
                .exec();

              for (let j = 0; j < quResult.length; j++) {
                if (quResult[j] != null) {
                  //add if already not in array
                  let found = Questions.find((q) => q._id.toString() == quResult[j]._id.toString());
                  // console.log("---hgffgfg", found);
                  if (found == null) {
                    Questions.push(quResult[j]);
                  }
                }
              }
            }
          }
          //set to array
          Questions = Array.from(Questions);
          // console.log("Questionsvvvvvvvvvvvvvvvvvvvvvvvvvv-", Questions);
          distinctQue = Array.from(new Set(Questions.map((q) => q._id))).map((id) => {
            return {
              _id: id,
              question: Questions.find((aid) => aid._id === id).question,
              allowConnectionRequest: Questions.find((aid) => aid._id === id).allowConnectionRequest,
              displayProfile: Questions.find((aid) => aid._id === id).displayProfile,
              view: Questions.find((aid) => aid._id === id).view,
              response: Questions.find((aid) => aid._id === id).response,
              status: Questions.find((aid) => aid._id === id).status,
              filter: Questions.find((aid) => aid._id === id).filter,
              createdAt: Questions.find((aid) => aid._id === id).createdAt,
              createdBy: Questions.find((aid) => aid._id === id).createdBy,
            };
          });
        }
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
        res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
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
      res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
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

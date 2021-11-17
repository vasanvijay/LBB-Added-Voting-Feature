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
    console.log("Criteria---->", criteria);
    try {
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      let question;
      if (search) {
        question = await global.models.GLOBAL.QUESTION.find({
          ...criteria,
          $and: [
            { _id: { $nin: user.answerLater } },
            { _id: { $nin: user.removeQuestion } },
          ],
          question: { $regex: search, $options: "i" },
        })
          .populate({
            path: "filter.filterId",
            populate: {
              path: "options",
              model: "filter",
              select: "_id",
            },
            model: "filter",
            select: "_id name",
          })
          .skip(skip)
          .limit(limit)
          .exec();
      } else {
        if (byUser) {
          question = await global.models.GLOBAL.QUESTION.find({
            ...criteria,
            $and: [
              { _id: { $nin: user.answerLater } },
              { _id: { $nin: user.removeQuestion } },
            ],
          })
            .populate({
              path: "filter.filterId",
              populate: {
                path: "options",
                model: "filter",
                select: "_id",
              },
              model: "filter",
              select: "_id name",
            })
            .skip(skip)
            .limit(limit)
            .exec();
        } else {
          question = await global.models.GLOBAL.QUESTION.find({
            ...criteria,
            createdBy: { $not: { $eq: user._id } },
            $and: [
              { _id: { $nin: user.answerLater } },
              { _id: { $nin: user.removeQuestion } },
            ],
          })
            .populate({
              path: "filter.filterId",
              populate: {
                path: "options",
                model: "filter",
                select: "_id",
              },
              model: "filter",
              select: "_id name",
            })
            .skip(skip)
            .limit(limit)
            .exec();
        }
      }
      question.map((quest, i) => {
        return quest?.filter.map((filt, j) => {
          return filt?.options.map(async (opt, k) => {
            return filt?.filterId?.options?.filter((o) => {
              if (o._id.toString() === opt._id.toString()) {
                allQuestion = [
                  ...question,
                  (question[i].filter[j].options[k] = o),
                ];
              }
            });
          });
        });
      });

      let findConection = await global.models.GLOBAL.CONNECTION.find({
        senderId: user._id,
      });

      let findUser = await global.models.GLOBAL.USER.find({
        _id: user._id,
      });

      let pandingConnection = await global.models.GLOBAL.CONNECTION.find({
        receiverId: user._id,
      });

      const blockIdExist = (id) => {
        console.log("ID--->>", id);
        return findUser.blockUser?.length
          ? findUser.blockUser.some(function (eld) {
              return eld.toString() == id.toString();
            })
          : false;
      };

      const sentIdExist = (id) => {
        console.log("ID--->>", id);
        var check = findConection.filter(function (elc) {
          return elc.receiverId.toString() == id.toString();
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
      const conectIdExist = (id) => {
        console.log("ID--->>", id);

        return user.accepted.length
          ? user.accepted.some(function (el) {
              return el.toString() == id.toString();
            })
          : false;
      };
      console.log("QUESTION----->>>", question);
      let questionDetais = [];
      for (let i = 0; i < question.length; i++) {
        if (conectIdExist(question[i].createdBy?._id)) {
          console.log("IF--------------<>");
          const questionDetaisObj = {
            _id: question[i]._id,
            displayProfile: question[i].displayProfile,
            allowConnectionRequest: question[i].allowConnectionRequest,
            view: question[i].view,
            response: question[i].response,
            status: question[i].status,
            question: question[i].question,
            reaches: question[i].reaches,
            filter: question[i]?.filter?.map((fil) => {
              return {
                filterId: fil?.filterId?._id,
                options: fil?.options,
              };
            }),
            createdAt: question[i].createdAt,
            createdBy: question[i].createdBy,
            isFriend: "true",
          };
          questionDetais.push(questionDetaisObj);
        } else if (sentIdExist(question[i].createdBy?._id)) {
          console.log("IN ELSE IF----------->>>>>>");
          const questionDetaisObj = {
            _id: question[i]._id,
            displayProfile: question[i].displayProfile,
            allowConnectionRequest: question[i].allowConnectionRequest,
            view: question[i].view,
            response: question[i].response,
            reaches: question[i].reaches,
            status: question[i].status,
            question: question[i].question,
            filter: question[i]?.filter?.map((fil) => {
              return {
                filterId: fil?.filterId?._id,
                options: fil?.options,
              };
            }),
            createdAt: question[i].createdAt,
            createdBy: question[i].createdBy,
            isFriend: "sent",
          };
          questionDetais.push(questionDetaisObj);
        } else if (pandingIdExist(question[i].createdBy?._id)) {
          console.log("ELSE IF--------->>>>");
          const questionDetaisObj = {
            _id: question[i]._id,
            displayProfile: question[i].displayProfile,
            allowConnectionRequest: question[i].allowConnectionRequest,
            view: question[i].view,
            response: question[i].response,
            reaches: question[i].reaches,
            status: question[i].status,
            question: question[i].question,
            filter: question[i]?.filter?.map((fil) => {
              return {
                filterId: fil?.filterId?._id,
                options: fil?.options,
              };
            }),
            createdAt: question[i].createdAt,
            createdBy: question[i].createdBy,
            isFriend: "pending",
          };
          questionDetais.push(questionDetaisObj);
        } else if (blockIdExist(question[i].createdBy?._id)) {
          console.log("BLOCK ELSE IF----->>>> ", question[i].createdBy?._id);
          const questionDetaisObj = {
            _id: question[i]._id,
            displayProfile: question[i].displayProfile,
            allowConnectionRequest: question[i].allowConnectionRequest,
            view: question[i].view,
            response: question[i].response,
            reaches: question[i].reaches,
            status: question[i].status,
            question: question[i].question,
            filter: question[i]?.filter?.map((fil) => {
              return {
                filterId: fil?.filterId?._id,
                options: fil?.options,
              };
            }),
            createdAt: question[i].createdAt,
            createdBy: question[i].createdBy,
            isFriend: "block",
          };
          questionDetais.push(questionDetaisObj);
        } else {
          console.log("ELSE------->>>", question[i].createdBy?._id);
          const questionDetaisObj = {
            _id: question[i]._id,
            displayProfile: question[i].displayProfile,
            allowConnectionRequest: question[i].allowConnectionRequest,
            view: question[i].view,
            response: question[i].response,
            reaches: question[i].reaches,
            status: question[i].status,
            question: question[i].question,
            filter: question[i]?.filter?.map((fil) => {
              return {
                filterId: fil?.filterId?._id,
                options: fil?.options,
              };
            }),
            createdAt: question[i].createdAt,
            createdBy: question[i].createdBy,
            isFriend: "false",
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
          questions: questionDetais,
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

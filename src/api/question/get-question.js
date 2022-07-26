const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const ObjectId = require("mongodb").ObjectId;

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

    // console.log("User------------------------question", question);

    // console.log("users-------", user);
    let criteria = {};
    if (byUser) {
      criteria = {
        createdBy: user._id,
        status: "active",
      };
      if (question) {
        // console.log("-----------------");
        criteria = {
          _id: ObjectId(question),
          createdBy: ObjectId(user._id),
        };
      }
    }
    if (question) {
      criteria = {
        _id: ObjectId(question),
      };
    }
    // console.log("CRITERIA--->>", criteria);
    try {
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      let count;
      let quResult;
      let questionDetails = [];
      if (byUser) {
        quResult = await global.models.GLOBAL.QUESTION.find({
          ...criteria,
          status: "active",
          createdBy: user._id,
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
        // console.log("byUser-------", quResult);
        count = await global.models.GLOBAL.QUESTION.count({
          ...criteria,
          createdBy: user._id,
          status: "active",
        });
      } else if (!byUser && search) {
        // // console.log("SEARCH-->>", search);
        user.subject.push(user.currentRole);
        user.subject.push(user.region);
        user.subject.push(user.gender);
        user.subject.push(user.countryOfResidence);
        user.subject.push(user.industry);
        user.subject.push(user.employeeNumber);
        user.subject.push(user.politicalAffiliation);
        user.subject.push(user.religiousAffiliation);
        user.subject.push(user.levelOfEducation);
        user.subject.push(user.sexualOrientation);
        user.subject = [...user.subject, ...user.ethnicity];
        user.subject = [...user.subject, ...user.countryOfOrigin];
        abuseQuestion = [];
        for (var i = 0; i < user.abuseQuestion.length; i++) {
          abuseQuestion.push(user.abuseQuestion[i].questionId);
        }
        // console.log("abuseQuestion--->>", user.subject);

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
              $or: [
                {
                  question: {
                    $regex: search,
                    $options: "i",
                  },
                },
                {
                  "user.currentRole": {
                    $regex: search,
                    $options: "i",
                  },
                },
              ],
            },
          },
          {
            $group: {
              _id: "createdBy",
              createdBy: {
                $push: "$_id",
              },
            },
          },
        ]);

        // console.log("qids--->>111", qids, search);
        // question: { $regex: search, $options: "i" },
        quResult = await global.models.GLOBAL.QUESTION.find({
          $and: [{ _id: { $nin: user.answerLater } }, { _id: { $nin: user.removeQuestion } }, { _id: { $nin: abuseQuestion } }, { createdBy: { $nin: user.blockUser } }, { createdBy: { $nin: user._id } }, { _id: { $in: qids[0]?.createdBy } }],
          $or: [{ "filter.options.optionName": { $exists: false } }, { "filter.options.optionName": { $in: user.subject } }],
          createdBy: { $nin: user.blockUser, $nin: user._id },
          reportAbuse: false,
          status: "active",
          ...criteria,
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

        count = await global.models.GLOBAL.QUESTION.count({
          // question: { $regex: search, $options: "i" },
          $and: [{ _id: { $nin: user.answerLater } }, { _id: { $nin: user.removeQuestion } }, { _id: { $nin: abuseQuestion } }, { createdBy: { $nin: user.blockUser } }, { _id: { $in: qids[0]?.createdBy } }],
          $or: [{ "filter.options.optionName": { $exists: false } }, { "filter.options.optionName": { $in: user.subject } }],
          createdBy: { $nin: user.blockUser, $nin: user._id },
          reportAbuse: false,
          status: "active",
        });
      } else {
        // for (var i = 0; i < user.blockUser.length; i++) {
        //   user.blockUser[i] = ObjectId(user.blockUser[i]);
        // }
        // for (var i = 0; i < user.removeQuestion.length; i++) {
        //   user.removeQuestion[i] = ObjectId(user.removeQuestion[i]);
        // }
        let abuseQuestion = [];
        for (var i = 0; i < user.abuseQuestion.length; i++) {
          abuseQuestion.push(user.abuseQuestion[i].questionId);
        }

        let questionArray = await global.models.GLOBAL.ANSWER.find().distinct("question", { $and: [{ createdBy: user._id }] });

        user.subject.push(user.currentRole);
        user.subject.push(user.region);
        user.subject.push(user.gender);
        user.subject.push(user.countryOfResidence);
        user.subject.push(user.industry);
        user.subject.push(user.employeeNumber);
        user.subject.push(user.politicalAffiliation);
        user.subject.push(user.religiousAffiliation);
        user.subject.push(user.levelOfEducation);
        user.subject.push(user.sexualOrientation);
        user.subject = [...user.subject, ...user.ethnicity];
        user.subject = [...user.subject, ...user.countryOfOrigin];
        // console.log("user.------------", user);

        // uncomment and use this if below query does not work
        // {
        //   // $and: [
        //   //   { _id: { $nin: user.answerLater } },
        //   //   { _id: { $nin: user.removeQuestion } },
        //   //   { _id: { $nin: abuseQuestion } },
        //   //   { _id: { $nin: questionArray } },
        //   //   { createdBy: { $nin: user.blockUser } },
        //   //   { createdBy: { $nin: user._id } },
        //   // ],
        //   // $or: [
        //   //   { "filter.options.optionName": { $exists: false } },
        //   //   { "filter.options.optionName": { $in: user.subject } },
        //   // ],
        //   // createdBy: { $nin: user.blockUser },
        //   // createdBy: { $nin: user._id },
        //   reportAbuse: false,
        // }
        if (question) {
          // console.log("quResult-->>>>>>>>>v", "quResult");
          quResult = await global.models.GLOBAL.QUESTION.find({
            ...criteria,
            status: "active",
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
        } else {
          quResult = await global.models.GLOBAL.QUESTION.find({
            $and: [{ _id: { $nin: user.answerLater } }, { _id: { $nin: user.removeQuestion } }, { _id: { $nin: abuseQuestion } }, { _id: { $nin: questionArray } }, { createdBy: { $nin: user.blockUser } }, { createdBy: { $nin: user._id } }, criteria],
            $or: [{ "filter.options.optionName": { $exists: false } }, { "filter.options.optionName": { $in: user.subject } }],
            createdBy: { $nin: user.blockUser },
            createdBy: { $nin: user._id },
            reportAbuse: false,
            status: "active",
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
        }

        // console.log("quResult-->>>>>>>>>v", quResult);
        // if (criteria) {
        //   console.log("im in criteria", criteria);
        //   quResult = await global.models.GLOBAL.QUESTION.find(criteria)
        //     .populate({
        //       path: "createdBy",
        //       model: "user",
        //       select: "_id name subject profileImage currentRole",
        //     })
        //     .skip(skip)
        //     .limit(limit)
        //     .sort({
        //       createdAt: -1,
        //     })
        //     .exec();

        //   console.log("quResult--", quResult);
        // }
        count = await global.models.GLOBAL.QUESTION.count({
          $and: [{ _id: { $nin: user.answerLater } }, { _id: { $nin: user.removeQuestion } }, { _id: { $nin: abuseQuestion } }, { createdBy: { $nin: user.blockUser } }],
          $or: [{ "filter.options.optionName": { $exists: false } }, { "filter.options.optionName": { $in: user.subject } }],
          createdBy: { $nin: user.blockUser, $nin: user._id },
          reportAbuse: false,
          ...criteria,
          status: "active",
        });
      }

      // today's Questions Count
      let TodayQuestion = await global.models.GLOBAL.QUESTION.count({
        createdAt: {
          $gte: moment(Date.now()).format("YYYY-MM-DD"),
        },
        status: "active",
      });

      //Questions Profile access
      let QuestionProfileAccess = await global.models.GLOBAL.QUESTION.count({
        displayProfile: true,
        status: "active",
      });

      // console.log("QuestionProfileAccess", QuestionProfileAccess);

      // Questions without profile Access
      let QuestionProfileWithoutAccess = await global.models.GLOBAL.QUESTION.count({
        displayProfile: false,
        status: "active",
      });

      let QuestionCount = await global.models.GLOBAL.QUESTION.count({});

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

      let optionNames = [];
      let reachCount = async (question) => {
        for (let k = 0; k < question.filter?.length; k++) {
          question?.filter[k]?.options?.map(async (item) => {
            optionNames.push(item.optionName);
          });
        }
        // console.log("OPT-->>", optionNames.length);
        if (optionNames.length > 0) {
          const users = await global.models.GLOBAL.USER.find({
            $text: { $search: optionNames.join(" ") },
          })
            .count()
            .then((ress) => ress);

          // console.log("22211122121121221211111", users);
          // // console.log("USER-->>", users);
          if (users == 0) {
            return await global.models.GLOBAL.USER.count();
          } else {
            return users;
          }
        } else {
          return await global.models.GLOBAL.USER.count();
        }
      };

      for (let i = 0; i < quResult.length; i++) {
        // console.log("quResult[i]", quResult[i]);
        if (quResult[i].createdBy != null) {
          if (conectIdExist(quResult[i]?.createdBy?._id)) {
            let questionObj = {
              _id: quResult[i]._id,
              displayProfile: quResult[i].displayProfile,
              allowConnectionRequest: quResult[i].allowConnectionRequest,
              response: quResult[i].response,
              status: quResult[i].status,
              question: quResult[i].question,
              filter: quResult[i]?.filter,
              rating: quResult[i]?.rating,
              upVote: quResult[i]?.upVote,
              downVote: quResult[i]?.downVote,
              createdAt: quResult[i].createdAt,
              userName: quResult[i].createdBy.name,
              createdBy: quResult[i].createdBy,
              isFriend: "true",
              reach: await reachCount(quResult[i]),
            };
            questionDetails.push(questionObj);
          } else if (sentIdExist(quResult[i].createdBy._id)) {
            let questionObj = {
              _id: quResult[i]._id,
              displayProfile: quResult[i].displayProfile,
              allowConnectionRequest: quResult[i].allowConnectionRequest,
              response: quResult[i].response,
              status: quResult[i].status,
              question: quResult[i].question,
              filter: quResult[i]?.filter,
              rating: quResult[i]?.rating,
              upVote: quResult[i]?.upVote,
              downVote: quResult[i]?.downVote,
              createdAt: quResult[i].createdAt,
              userName: quResult[i].createdBy.name,
              createdBy: quResult[i].createdBy,
              isFriend: "sent",
              reach: await reachCount(quResult[i]),
            };
            questionDetails.push(questionObj);
          } else if (pandingIdExist(quResult[i].createdBy._id)) {
            let questionObj = {
              _id: quResult[i]._id,
              displayProfile: quResult[i].displayProfile,
              allowConnectionRequest: quResult[i].allowConnectionRequest,
              response: quResult[i].response,
              status: quResult[i].status,
              question: quResult[i].question,
              filter: quResult[i]?.filter,
              rating: quResult[i]?.rating,
              upVote: quResult[i]?.upVote,
              downVote: quResult[i]?.downVote,
              createdAt: quResult[i].createdAt,
              userName: quResult[i].createdBy.name,
              createdBy: quResult[i].createdBy,
              isFriend: "pending",
              reach: await reachCount(quResult[i]),
            };
            questionDetails.push(questionObj);
          } else {
            let questionObj = {
              _id: quResult[i]._id,
              displayProfile: quResult[i].displayProfile,
              allowConnectionRequest: quResult[i].allowConnectionRequest,
              response: quResult[i].response,
              status: quResult[i].status,
              question: quResult[i].question,
              filter: quResult[i]?.filter,
              rating: quResult[i]?.rating,
              upVote: quResult[i]?.upVote,
              downVote: quResult[i]?.downVote,
              createdAt: quResult[i].createdAt,
              userName: quResult[i].createdBy.name,
              createdBy: quResult[i].createdBy,
              isFriend: "false",
              reach: await reachCount(quResult[i]),
            };
            questionDetails.push(questionObj);
          }
        }
      }

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: {
          questions: questionDetails,
          count: count,
          todaysCount: TodayQuestion,
          profileaccess: QuestionProfileAccess,
          withoutprofileaccess: QuestionProfileWithoutAccess,
          questioncount: QuestionCount,
          page: page,
          limit: limit,
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

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
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      let count;
      let quResult;
      let questionDetais = [];
      if (byUser) {
        quResult = await global.models.GLOBAL.QUESTION.find({
          ...criteria,
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
        count = await global.models.GLOBAL.QUESTION.count({
          createdBy: user._id,
        });
        // res.send(quResult);
      } else if (!byUser && search) {
        console.log("SEARCH-->>", search);
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

        // return res.send({ sub: subjects });
        quResult = await global.models.GLOBAL.QUESTION.find({
          question: { $regex: search, $options: "i" },
          _id: {
            $nin: user.answerLater,
            $nin: user.removeQuestion,
            $nin: user.abuseQuestion,
          },
          "filter.options.optionName": { $in: user.subject },
          createdBy: { $nin: user.blockUser, $nin: user._id },
          reportAbuse: false,
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
          question: { $regex: search, $options: "i" },
          _id: {
            $nin: user.answerLater,
            $nin: user.removeQuestion,
            $nin: user.abuseQuestion,
          },
          "filter.options.optionName": { $in: user.subject },
          createdBy: { $nin: user.blockUser, $nin: user._id },
          reportAbuse: false,
        });
        // res.send(quResult);
      } else {
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
        // console.log("CRITERIA", criteria);
        // console.log("dsfdsfsdf", user.subject);
        // return res.send({ sub: subjects });
        quResult = await global.models.GLOBAL.QUESTION.find({
          _id: {
            $nin: user.answerLater,
            $nin: user.removeQuestion,
            $nin: user.abuseQuestion,
          },
          "filter.options.optionName": { $in: user.subject },
          createdBy: { $nin: user.blockUser, $nin: user._id },
          reportAbuse: false,
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
          _id: {
            $nin: user.answerLater,
            $nin: user.removeQuestion,
            $nin: user.abuseQuestion,
          },
          "filter.options.optionName": { $in: user.subject },
          createdBy: { $nin: user.blockUser, $nin: user._id },
          reportAbuse: false,
        });
        // res.send(quResult);
      }

      // today's Questions Count
      let TodayQuestion = await global.models.GLOBAL.QUESTION.count({
        createdAt: {
          $gte: moment(new Date()).format("YYYY-MM-DD"),
        },
      });

      //Questions Profile access
      let QuestionProfileAccess = await global.models.GLOBAL.QUESTION.count({
        criteria,
        displayProfile: true,
      });

      // Questions without profile Access
      let QuestionProfileWithoutAccess =
        await global.models.GLOBAL.QUESTION.count({
          displayProfile: false,
        });

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
      for (let i = 0; i < quResult.length; i++) {
        if (conectIdExist(quResult[i]._id)) {
          let questionObj = {
            _id: quResult[i]._id,
            displayProfile: quResult[i].displayProfile,
            allowConnectionRequest: quResult[i].allowConnectionRequest,
            response: quResult[i].response,
            status: quResult[i].status,
            question: quResult[i].question,
            filter: quResult[i]?.filter,
            createdAt: quResult[i].createdAt,
            userName: quResult[i].createdBy.name,
            createdBy: quResult[i].createdBy,
            isFriend: "true",
            reach: await reachCount(quResult[i]),
          };
          questionDetais.push(questionObj);
        } else if (sentIdExist(quResult[i]._id)) {
          let questionObj = {
            _id: quResult[i]._id,
            displayProfile: quResult[i].displayProfile,
            allowConnectionRequest: quResult[i].allowConnectionRequest,
            response: quResult[i].response,
            status: quResult[i].status,
            question: quResult[i].question,
            filter: quResult[i]?.filter,
            createdAt: quResult[i].createdAt,
            userName: quResult[i].createdBy.name,
            createdBy: quResult[i].createdBy,
            isFriend: "sent",
            reach: await reachCount(quResult[i]),
          };
          questionDetais.push(questionObj);
        } else if (pandingIdExist(quResult[i]._id)) {
          let questionObj = {
            _id: quResult[i]._id,
            displayProfile: quResult[i].displayProfile,
            allowConnectionRequest: quResult[i].allowConnectionRequest,
            response: quResult[i].response,
            status: quResult[i].status,
            question: quResult[i].question,
            filter: quResult[i]?.filter,
            createdAt: quResult[i].createdAt,
            userName: quResult[i].createdBy.name,
            createdBy: quResult[i].createdBy,
            isFriend: "pending",
            reach: await reachCount(quResult[i]),
          };
          questionDetais.push(questionObj);
        } else {
          let questionObj = {
            _id: quResult[i]._id,
            displayProfile: quResult[i].displayProfile,
            allowConnectionRequest: quResult[i].allowConnectionRequest,
            response: quResult[i].response,
            status: quResult[i].status,
            question: quResult[i].question,
            filter: quResult[i]?.filter,
            createdAt: quResult[i].createdAt,
            userName: quResult[i].createdBy.name,
            createdBy: quResult[i].createdBy,
            isFriend: "false",
            reach: await reachCount(quResult[i]),
          };
          questionDetais.push(questionObj);
        }
      }
      // console.log("RES--->>", questionDetais);
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: {
          questions: questionDetais,
          count: count,
          todaysCount: TodayQuestion,
          profileaccess: QuestionProfileAccess,
          withoutprofileaccess: QuestionProfileWithoutAccess,
          page: page,
          limit: limit,
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

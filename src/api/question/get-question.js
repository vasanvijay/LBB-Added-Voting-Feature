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
    try {
      if (user.userType !== enums.USER_TYPE.ADMIN) {
        req.query.page = req.query.page ? req.query.page : 1;
        let page = parseInt(req.query.page);
        req.query.limit = req.query.limit ? req.query.limit : 10;
        let limit = parseInt(req.query.limit);
        let skip = (parseInt(req.query.page) - 1) * limit;
        let question;
        let count;
        let reachCount;
        let reach = await global.models.GLOBAL.USER.count();
        if (search) {
          for (let i = 0; i < user.subject.length; i++) {
            question = await global.models.GLOBAL.QUESTION.find({
              ...criteria,
              $and: [
                { _id: { $nin: user.answerLater } },
                { _id: { $nin: user.removeQuestion } },
                // { _id: { $nin: user.abuseQuestion.questionId } },
                { createdBy: { $nin: user.blockUser } },
                { reportAbuse: { $nin: true } },
                // { "filter.options.optionName": user.subject[i] },
                { status: { $eq: "active" } },
              ],
              question: { $regex: search, $options: "i" },
            })
              .populate({
                path: "createdBy",
                model: "user",
                select: "_id name subject profileImage currentRole",
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
              .sort({
                createdAt: -1,
              })
              .exec();
            count = await global.models.GLOBAL.QUESTION.count({
              ...criteria,
              $and: [
                { _id: { $nin: user.answerLater } },
                { _id: { $nin: user.removeQuestion } },
                // { _id: { $nin: user.abuseQuestion.questionId } },
                { createdBy: { $nin: user.blockUser } },
                { reportAbuse: { $nin: true } },
                // { "filter.options.optionName": user.subject[i] },
                // { status: { $eq: "active" } },
              ],
              question: { $regex: search, $options: "i" },
            });
          }
          if (question.filter) {
            reachCount = await global.models.GLOBAL.QUESTION.aggregate([
              // {
              //   $match: {
              //     filter: {
              //       $gt: {
              //         $size: "$filter",
              //       },
              //     },
              //   },
              // },
              {
                $project: {
                  _id: "$_id",
                  filter: {
                    filterId: "$filter.filterId",
                    filterName: "$filter.filterName",
                    options: "$filter.options.optionName",
                  },
                },
              },
              {
                $project: {
                  _id: "$_id",
                  filter: {
                    $slice: ["$filter", 1],
                  },
                },
              },
            ]);
            // console.log("reachCount ---->", reachCount);
            reachCount?.map(async (object, objIndex) => {
              for (let i = 0; i < object?.filter[0].filterId?.length; i++) {
                // console.log("index ---->", i);
                if (
                  object?.filter[0].filterId[i] == "619e07b7641d2f00f887ec96"
                ) {
                  reachCount[objIndex].filter[0].reach =
                    await global.models.GLOBAL.USER.aggregate([
                      {
                        $match: {
                          subject: {
                            $in: object?.filter?.[0]?.options[i],
                          },
                        },
                      },
                      {
                        $count: "subject",
                      },
                    ]);
                }
              }
              // console.log(`filterr`, reachCount[objIndex].filter[0]);
            });
          } else {
            reachCount = await global.models.GLOBAL.USER.count();
          }
        } else {
          if (byUser) {
            for (let i = 0; i < user.subject.length; i++) {
              question = await global.models.GLOBAL.QUESTION.find({
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
              console.log("QUES-->", question);
              count = await global.models.GLOBAL.QUESTION.count({
                ...criteria,
              });
            }
            if (question.filter) {
              reachCount = await global.models.GLOBAL.QUESTION.aggregate([
                // {
                //   $match: {
                //     filter: {
                //       $gt: {
                //         $size: "$filter",
                //       },
                //     },
                //   },
                // },
                {
                  $project: {
                    _id: "$_id",
                    filter: {
                      filterId: "$filter.filterId",
                      filterName: "$filter.filterName",
                      options: "$filter.options.optionName",
                    },
                  },
                },
                {
                  $project: {
                    _id: "$_id",
                    filter: {
                      $slice: ["$filter", 1],
                    },
                  },
                },
              ]);
              // console.log("reachCount ---->", reachCount);
              reachCount?.map(async (object, objIndex) => {
                for (let i = 0; i < object?.filter[0].filterId?.length; i++) {
                  // console.log("index ---->", i);
                  if (
                    object?.filter[0].filterId[i] == "619e07b7641d2f00f887ec96"
                  ) {
                    reachCount[objIndex].filter[0].reach =
                      await global.models.GLOBAL.USER.aggregate([
                        {
                          $match: {
                            subject: {
                              $in: object?.filter?.[0]?.options[i],
                            },
                          },
                        },
                        {
                          $count: "subject",
                        },
                      ]);
                  }
                }
                // console.log(`filterr`, reachCount[objIndex].filter[0]);
              });
            } else {
              reachCount = await global.models.GLOBAL.USER.count();
            }
          } else {
            let flag = [];
            for (let i = 0; i < user.subject.length; i++) {
              question = await global.models.GLOBAL.QUESTION.find({
                ...criteria,
                createdBy: { $not: { $eq: user._id } },
                $and: [
                  { _id: { $nin: user.answerLater } },
                  { _id: { $nin: user.removeQuestion } },
                  // { _id: { $nin: user.abuseQuestion.questionId } },
                  { createdBy: { $nin: user.blockUser } },
                  { reportAbuse: { $nin: true } },
                  // { "filter.options.optionName": { $eq: user.subject[i] } },
                  // { status: { $eq: "active" } },
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
              // question.map((que) => {
              //   if (que.filter.length) {
              //     // console.log("questionData---->", que.filter);
              //     que.filter.map((options) => {
              //       if (options.options.length) {
              //         options.options.map((option) => {
              //           if (option.optionName === user.subject[i]) {
              //             console.log("optionDataData---->", option);
              //           }
              //         });
              //       }
              //     });
              //   }
              // });
              // for (let a = 0; a < question.length; a++) {
              //   for (let j = 0; j < question[a].filter.length; j++) {
              //     for (
              //       let k = 0;
              //       k < question[a].filter[j].options.length;
              //       k++
              //     ) {
              //       if (
              //         question[a].filter[j].options[k].optionName ===
              //         user.subject[i]
              //       ) {
              //         // console.log("questionData---->", question[a]);
              //         flag.push(question[a]._id);

              //         // if(!flag.includes(question[a]._id)){
              //         //   flag.push(question[a]._id);
              //         //   question.push(question[a]);
              //         // }
              //       }
              //     }
              //   }
              // }
              // console.log("QUE-->", question);
              count = await global.models.GLOBAL.QUESTION.countDocuments({
                ...criteria,
                createdBy: { $not: { $eq: user._id } },
                $and: [
                  { _id: { $nin: user.answerLater } },
                  { _id: { $nin: user.removeQuestion } },
                  { createdBy: { $nin: user.blockUser } },
                  { reportAbuse: { $nin: true } },
                  // { "filter.options.optionName": user.subject[i] },
                  // { status: { $eq: "active" } },
                ],
              });
            }
            if (question.filter) {
              reachCount = await global.models.GLOBAL.QUESTION.aggregate([
                {
                  $match: {
                    filter: {
                      $gt: {
                        $size: "$filter",
                      },
                    },
                  },
                },
                {
                  $project: {
                    _id: "$_id",
                    filter: {
                      filterId: "$filter.filterId",
                      filterName: "$filter.filterName",
                      options: "$filter.options.optionName",
                    },
                  },
                },
                {
                  $project: {
                    _id: "$_id",
                    filter: {
                      $slice: ["$filter", 1],
                    },
                  },
                },
              ]);
              // console.log("reachCount ---->", reachCount);
              reachCount?.map(async (object, objIndex) => {
                for (let i = 0; i < object?.filter[0].filterId?.length; i++) {
                  // console.log("index ---->", i);
                  if (
                    object?.filter[0].filterId[i] == "619e07b7641d2f00f887ec96"
                  ) {
                    reachCount[objIndex].filter[0].reach =
                      await global.models.GLOBAL.USER.aggregate([
                        {
                          $match: {
                            subject: {
                              $in: object?.filter?.[0]?.options[i],
                            },
                          },
                        },
                        {
                          $count: "subject",
                        },
                      ]);
                  }
                }
                // console.log(`filterr`, reachCount[objIndex].filter[0]);
              });
            } else {
              reachCount = await global.models.GLOBAL.USER.count();
            }
          }
        }
        // question.map((quest, i) => {
        //   return quest?.filter.map((filt, j) => {
        //     return filt?.options.map(async (opt, k) => {
        //       return filt?.filterId?.options?.filter((o) => {
        //         if (o._id.toString() === opt._id.toString()) {
        //           allQuestion = [
        //             ...question,
        //             (question[i].filter[j].options[k] = o),
        //           ];
        //         }
        //       });
        //     });
        //   });
        // });

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
          return findUser.blockUser?.length
            ? findUser.blockUser.some(function (eld) {
                return eld.toString() == id.toString();
              })
            : false;
        };

        const sentIdExist = (id) => {
          var check = findConection.filter(function (elc) {
            return elc.receiverId.toString() == id.toString();
          });
          return check.length;
        };
        const pandingIdExist = (id) => {
          let panding = pandingConnection.filter(function (elf) {
            return elf.senderId.toString() === id.toString();
          });
          return panding.length;
        };
        const conectIdExist = (id) => {
          return user.accepted.length
            ? user.accepted.some(function (el) {
                return el.toString() == id.toString();
              })
            : false;
        };
        let questionDetais = [];
        for (let i = 0; i < question.length; i++) {
          let reaches = 0;
          let reachCounts = reachCount.map((count) => {
            if (count.filter[0].reach) {
              if (question[i]._id.toString() == count._id) {
                reaches = count;
              }
            }
          });
          console.log("COUNT---<>>", reach);
          if (conectIdExist(question[i].createdBy?._id)) {
            const questionDetaisObj = {
              _id: question[i]._id,
              displayProfile: question[i].displayProfile,
              allowConnectionRequest: question[i].allowConnectionRequest,
              view: question[i].view,
              response: question[i].response,
              status: question[i].status,
              question: question[i].question,
              reaches: question[i].reaches,
              filter: question[i]?.filter,
              // ?.map((fil) => {
              //   return {
              //     filterId: fil?.filterId?._id,
              //     options: fil?.options,
              //   };
              // }),
              createdAt: question[i].createdAt,
              userName: question[i].createdBy.name,
              createdBy: question[i].createdBy,
              isFriend: "true",
              reach: reaches == 0 ? reach : reaches.filter[0].reach[0].subject,
            };
            questionDetais.push(questionDetaisObj);
          } else if (sentIdExist(question[i].createdBy?._id)) {
            const questionDetaisObj = {
              _id: question[i]._id,
              displayProfile: question[i].displayProfile,
              allowConnectionRequest: question[i].allowConnectionRequest,
              view: question[i].view,
              response: question[i].response,
              reaches: question[i].reaches,
              status: question[i].status,
              question: question[i].question,
              filter: question[i]?.filter,
              // ?.map((fil) => {
              //   return {
              //     filterId: fil?.filterId?._id,
              //     options: fil?.options,
              //   };
              // }),
              createdAt: question[i].createdAt,
              userName: question[i].createdBy.name,
              createdBy: question[i].createdBy,
              isFriend: "sent",
              reach: reaches == 0 ? reach : reaches.filter[0].reach[0].subject,
            };
            questionDetais.push(questionDetaisObj);
          } else if (pandingIdExist(question[i].createdBy?._id)) {
            const questionDetaisObj = {
              _id: question[i]._id,
              displayProfile: question[i].displayProfile,
              allowConnectionRequest: question[i].allowConnectionRequest,
              view: question[i].view,
              response: question[i].response,
              reaches: question[i].reaches,
              status: question[i].status,
              question: question[i].question,
              filter: question[i]?.filter,
              // ?.map((fil) => {
              //   return {
              //     filterId: fil?.filterId?._id,
              //     options: fil?.options,
              //   };
              // }),
              createdAt: question[i].createdAt,
              userName: question[i].createdBy.name,
              createdBy: question[i].createdBy,
              isFriend: "pending",
              reach: reaches == 0 ? reach : reaches.filter[0].reach[0].subject,
            };
            questionDetais.push(questionDetaisObj);
          } else if (blockIdExist(question[i].createdBy?._id)) {
            const questionDetaisObj = {
              _id: question[i]._id,
              displayProfile: question[i].displayProfile,
              allowConnectionRequest: question[i].allowConnectionRequest,
              view: question[i].view,
              response: question[i].response,
              reaches: question[i].reaches,
              status: question[i].status,
              question: question[i].question,
              filter: question[i]?.filter,
              // ?.map((fil) => {
              //   return {
              //     filterId: fil?.filterId?._id,
              //     options: fil?.options,
              //   };
              // }),
              createdAt: question[i].createdAt,
              userName: question[i].createdBy.name,
              createdBy: question[i].createdBy,
              isFriend: "block",
              reach: reaches == 0 ? reach : reaches.filter[0].reach[0].subject,
            };
            questionDetais.push(questionDetaisObj);
          } else {
            const questionDetaisObj = {
              _id: question[i]._id,
              displayProfile: question[i].displayProfile,
              allowConnectionRequest: question[i].allowConnectionRequest,
              view: question[i].view,
              response: question[i].response,
              reaches: question[i].reaches,
              status: question[i].status,
              question: question[i].question,
              filter: question[i]?.filter,
              // ?.map((fil) => {
              //   return {
              //     filterId: fil?.filterId?._id,
              //     options: fil?.options,
              //   };
              // }),
              createdAt: question[i].createdAt,
              userName: question[i].createdBy.name,
              createdBy: question[i].createdBy,
              isFriend: "false",
              reach: reaches == 0 ? reach : reaches.filter[0].reach[0].subject,
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
            count: count,
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
      } else {
        req.query.page = req.query.page ? req.query.page : 1;
        let page = parseInt(req.query.page);
        req.query.limit = req.query.limit ? req.query.limit : 10;
        let limit = parseInt(req.query.limit);
        let skip = (parseInt(req.query.page) - 1) * limit;
        let questionDetais = await global.models.GLOBAL.QUESTION.find()
          .populate({
            path: "createdBy",
            model: "user",
            select: "_id name subject profileImage currentRole",
          })
          .skip(skip)
          .limit(limit)
          .exec();
        let count = await global.models.GLOBAL.QUESTION.count();
        let TodayQuestion = await global.models.GLOBAL.QUESTION.count({
          createdAt: {
            $gte: moment(new Date()).format("YYYY-MM-DD"),
          },
        });
        if (questionDetais) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.SUCCESS,
            payload: {
              questions: questionDetais,
              count: count,
              todaysCount: TodayQuestion,
              page,
              limit,
            },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
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

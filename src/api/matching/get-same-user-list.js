const { ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;

    try {
      let userId = [];
      let findMatching = await global.models.GLOBAL.MATCHING.find({
        matchingBy: user._id,
      });
      // // console.log("findMatching--->>", findMatching);
      for (let i = 0; i < findMatching.length; i++) {
        userId.push(findMatching[i].matchingTo);
      }
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      let findSameSubjectUser = await global.models.GLOBAL.USER.aggregate([
        {
          $facet: {
            zero: [
              {
                $match: {
                  subject: {
                    $nin: user.subject,
                  },
                },
              },
              {
                $project: {
                  _id: "$_id",
                },
              },
              {
                $addFields: {
                  matches: 0,
                },
              },
            ],
            other: [
              {
                $match: {
                  subject: {
                    $in: user.subject,
                  },
                },
              },
              {
                $unwind: "$subject",
              },
              {
                $match: {
                  subject: {
                    $in: user.subject,
                  },
                },
              },
              {
                $group: {
                  _id: "$_id",
                  matches: {
                    $sum: 1,
                  },
                },
              },
              {
                $sort: {
                  matches: -1,
                },
              },
            ],
          },
        },
        {
          $project: {
            alldata: {
              $setUnion: ["$other", "$zero"],
            },
          },
        },
        {
          $unwind: {
            path: "$alldata",
          },
        },
        {
          $project: {
            _id: "$alldata._id",
            matches: "$alldata.matches",
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
          },
        },
        {
          $project: {
            _id: 1,
            matches: 1,
            name: "$user.name",
            email: "$user.email",
            region: "$user.region",
            profileImage: "$user.profileImage",
            currentRole: "$user.currentRole",
            subject: "$user.subject",
            createdAt: "$user.createdAt",
            lastLogin: "$user.lastLogin",
            accepted: "$user.accepted",
          },
        },
        {
          $match: {
            $and: [
              { _id: { $ne: ObjectId(user._id) } },
              { _id: { $nin: userId } },
            ],
          },
        },
        {
          $lookup: {
            from: "question",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$id", "$createdBy"],
                  },
                },
              },
            ],
            as: "questionCount",
          },
        },
        {
          $lookup: {
            from: "answer",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$id", "$createdBy"],
                  },
                },
              },
              {
                $group: {
                  _id: "$question",
                },
              },
            ],
            as: "answerCount",
          },
        },
        {
          $addFields: {
            questionCount: {
              $size: "$questionCount",
            },
          },
        },
        {
          $addFields: {
            answerCount: {
              $size: "$answerCount",
            },
          },
        },
        {
          $sort: {
            matches: -1,
          },
        },
      ])
        .skip(skip)
        .limit(limit);

      console.log("UserDatatatatata", findSameSubjectUser);
      // // console.log("USER-->>", findSameSubjectUser.length);

      //   return res.send(findSameSubjectUser);
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: {
          findSameSubjectUser,
          count: findSameSubjectUser.length,
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

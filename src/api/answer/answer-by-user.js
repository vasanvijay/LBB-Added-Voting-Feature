const Joi = require("joi");
const { ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      let { user } = req;
      // console.log("USER--->>>", user);
      let { question } = req.params;
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: question,
      });
      if (findQuestion) {
        const id = question;
        const answerBy = user._id;
        const questionBy = findQuestion.createdBy;
        // let answerRoom;
        let participateIds = [];
        participateIds.push(answerBy);
        participateIds.push(id);
        participateIds.push(questionBy);
        let abuseAnswer = [];
        for (let i = 0; i < user.abuseAnswer.length; i++) {
          abuseAnswer.push(user.abuseAnswer[i].answerId);
        }
        console.log("ABUSE--->>>", abuseAnswer);
        let findRoom = await global.models.GLOBAL.ANSWER_ROOM.find({
          participateIds: {
            $size: participateIds.length,
            $all: [...participateIds],
          },
        });
        let ids = [];
        for (let i = 0; i < findRoom.length; i++) {
          ids.push(findRoom[i]._id);
        }
        console.log("ROOM-->>", ids);
        let answerRoom = await global.models.GLOBAL.ANSWER_ROOM.aggregate([
          {
            $match: {
              _id: { $in: ids },
            },
          },
          {
            $unwind: {
              path: "$answer",
            },
          },
          {
            $match: {
              "answer.answerId": {
                $nin: abuseAnswer,
              },
            },
          },
          {
            $lookup: {
              from: "user",
              localField: "answer.answerBy",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $lookup: {
              from: "question",
              localField: "questionId",
              foreignField: "_id",
              as: "question",
            },
          },
          {
            $project: {
              _id: 1,
              participateIds: 1,
              createdAt: 1,
              answer: 1,
              "user._id": 1,
              "user.profileImage": 1,
              "user.currentRole": 1,
              "user.subject": 1,
              "user.email": 1,
              "user.region": 1,
              "user.name": 1,
              question: 1,
            },
          },
          {
            $group: {
              _id: "$_id",
              data: {
                $push: {
                  participateIds: "$participateIds",
                  createdAt: "$createdAt",
                  answer: "$answer",
                  user: "$user",
                  question: "$question",
                },
              },
            },
          },
        ]);

        console.log("answerRoom--->>", answerRoom);

        // let answerRoom = await global.models.GLOBAL.ANSWER_ROOM.find({
        //   participateIds: {
        //     $size: participateIds.length,
        //     $all: [...participateIds],
        //   },
        // })
        //   .populate({
        //     path: "answer.answerBy",
        //     model: "user",
        //     select: "_id name email region currentRole profileImage subject",
        //   })
        //   .populate({
        //     path: "questionId",
        //     model: "question",
        //     select: "_id question response view createdBy",
        //   });
        // console.log("answerRoom--->>", answerRoom);
        let staredCount = await global.models.GLOBAL.ANSWER_ROOM.count({
          $and: [
            {
              participateIds: {
                $size: participateIds.length,
                $all: [...participateIds],
              },
            },
            { "answer.answerBy": { $eq: user._id } },
            { "answer.messageStar": true },
          ],
        });
        // console.log("StarCOunt--->>>", staredCount);
        if (answerRoom != null) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: { answerRoom, staredCount },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.GENERAL,
            payload: {},
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
          message: messages.ITEM_NOT_FOUND,
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

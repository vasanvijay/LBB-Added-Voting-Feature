const Joi = require("joi");
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
        let answerRoom = await global.models.GLOBAL.ANSWER_ROOM.find({
          participateIds: {
            $size: participateIds.length,
            $all: [...participateIds],
          },
        })
          .populate({
            path: "answer.answerBy",
            model: "user",
            select: "_id name email region currentRole profileImage subject",
          })
          .populate({
            path: "questionId",
            model: "question",
            select: "_id question response view createdBy",
          });
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
        console.log("StarCOunt--->>>", staredCount);
        // .populate({
        //   path: "participateIds",
        //   model: "user",
        //   select: "_id name email region currentRole profileImage",
        // });
        if (answerRoom != null) {
          // let answerRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
          //   questionId: question,
          // });
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: { answerRoom },
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

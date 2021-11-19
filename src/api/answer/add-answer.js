const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add Answer
module.exports = exports = {
  // route validation
  validation: Joi.object({
    answer: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { question } = req.params;
    const { answer } = req.body;
    if (!question || !answer) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    try {
      let findQuestion = await global.models.GLOBAL.QUESTION.find({
        _id: question,
      });
      console.log("question--->>>", findQuestion);
      if (findQuestion) {
        console.log("findQuestion?._id", findQuestion[0]._id);
        console.log("user._id", user._id);
        console.log("findQuestion?.createdBy", findQuestion[0].createdBy);
        const { id } = findQuestion[0]._id;
        const { answerBy } = user._id;
        const { questionBy } = findQuestion[0].createdBy;

        let participateIds = [];
        participateIds.push(answerBy);
        participateIds.push(id);
        participateIds.push(questionBy);

        let answerRoom = await global.models.GLOBAL.ANSWER_ROOM.find({
          participateIds: {
            $size: participateIds.length,
            $all: [...participateIds],
          },
        });

        if (answerRoom) {
          console.log("Answer room---<>", answerRoom);
          let newAnswer = {
            answer: answer,
            answerBy: user._id,
          };
          let updateAnswer =
            await global.models.GLOBAL.ANSWER_ROOM.findOneAndUpdate(
              { _id: answerRoom._id },
              { $addToSet: { answer: newAnswer } }
            );
          if (updateAnswer) {
            console.log("UPDATED----->>>>", updateAnswer);
          }
        } else {
          let newAnswer = {
            answer: answer,
            answerBy: user._id,
          };
          let roomObj = {
            participateIds: participateIds,
            questionId: question,
            answer: newAnswer,
            createdAt: user._id,
          };
          answerRoom = await global.models.GLOBAL.ANSWER_ROOM(roomObj);

          answerRoom.save();
          console.log("Answer ROOM-------->>><<>>>", answerRoom);
        }

        let addAnswer = {
          answer: answer,
          answerBy: user._id,
          question: question,
          answerAt: Date.now(),
        };
        const newAnswer = await global.models.GLOBAL.ANSWER(addAnswer);
        newAnswer.save();
        await global.models.GLOBAL.QUESTION.updateOne(
          { _id: question },
          { $inc: { response: 1 } },
          { new: true }
        );
        await global.models.GLOBAL.USER.findOneAndUpdate(
          { _id: user._id },
          {
            $pull: {
              answerLater: question,
            },
          }
        );
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_INSERTED,
          payload: { newAnswer },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
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

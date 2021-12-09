const { ObjectID } = require("bson");
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
      let answerRoom;
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: question,
      });
      if (findQuestion) {
        const id = findQuestion._id;
        const answerBy = user._id;
        const questionBy = findQuestion.createdBy;

        let participateIds = [];
        participateIds.push(answerBy);
        participateIds.push(id);
        participateIds.push(questionBy);

        answerRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
          participateIds: {
            $size: participateIds.length,
            $all: [...participateIds],
          },
        });

        if (answerRoom != null) {
          let newAnswer = {
            answer: answer,
            answerBy: user._id,
          };

          let updateAnswer =
            await global.models.GLOBAL.ANSWER_ROOM.findOneAndUpdate(
              { _id: ObjectID(answerRoom._id) },
              {
                $push: {
                  answer: newAnswer,
                },
              },
              { new: true }
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
            createdAt: Date.now(),
          };
          answerRoom = await global.models.GLOBAL.ANSWER_ROOM(roomObj);

          answerRoom.save();
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
        let ntfObj = {
          userId: user._id,
          receiverId: questionBy,
          title: `Notification By ${user._id} to ${questionBy}`,
          description: ` Give Answer to Your Question's ${findQuestion.question}`,
          createdBy: user._id,
          updatedBy: user._id,
          question: question,
        };

        let notification = await global.models.GLOBAL.NOTIFICATION(ntfObj);
        notification.save();

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

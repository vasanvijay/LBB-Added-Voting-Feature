const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add Answer
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { question, answer } = req;
    let user = await utils.getHeaderFromToken(req.user);
    // console.log("USER--->>", user);
    if (!question || !answer) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
    }

    try {
      let newAnswer;
      let answerRoom;
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: question,
      });
      if (findQuestion) {
        const id = findQuestion._id;
        const answerBy = user.id;
        const questionBy = findQuestion.createdBy;

        console.log("id -->>", id);
        console.log("answerBy -->>", answerBy);
        console.log("questionBy -->>", questionBy);

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
          let addAnswer = {
            roomId: answerRoom._id,
            answer: answer,
            createdBy: user.id,
            question: question,
            createdAt: Date.now(),
          };
          newAnswer = await global.models.GLOBAL.ANSWER.create(addAnswer);
          // console.log("here in if--->", newAnswer);
        } else {
          let roomObj = {
            participateIds: participateIds,
            questionId: question,
            createdAt: Date.now(),
            createdBy: user.id,
          };
          answerRoom = await global.models.GLOBAL.ANSWER_ROOM.create(roomObj);
          // console.log("here in else answerRoom--->", answerRoom);

          let addAnswer = {
            roomId: answerRoom._id,
            answer: answer,
            createdBy: user.id,
            question: question,
            createdAt: Date.now(),
          };
          newAnswer = await global.models.GLOBAL.ANSWER.create(addAnswer);
          // console.log("here in else newAnswer--->", newAnswer);
        }

        await global.models.GLOBAL.QUESTION.updateOne(
          { _id: question },
          { $inc: { response: 1 } },
          { new: true }
        );
        await global.models.GLOBAL.USER.findOneAndUpdate(
          { _id: user.id },
          {
            $pull: {
              answerLater: question,
            },
          }
        );
        let ntfObj = {
          userId: user.id,
          receiverId: questionBy,
          title: `Notification By ${user.id} to ${questionBy}`,
          description: ` Give Answer to Your Question's ${findQuestion.question}`,
          createdBy: user.id,
          updatedBy: user.id,
          question: question,
          createdAt: Date.now(),
        };

        let notification = await global.models.GLOBAL.NOTIFICATION.create(
          ntfObj
        );

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_INSERTED,
          payload: { answer: newAnswer },
          logPayload: false,
        };
        return data4createResponseObject;
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.GENERAL,
          payload: {},
          logPayload: false,
        };
        return data4createResponseObject;
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
      return data4createResponseObject;
    }
  },
};

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add Answer
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { question, answer, roomId } = req;
    let user = await utils.getHeaderFromToken(req.user);
    console.log("USER--->>", user);
    if (!question || !answer || !roomId) {
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
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: question,
      });
      if (findQuestion) {
        let findRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
          _id: roomId,
        });
        if (findRoom) {
          let addAnswer = {
            roomId: roomId,
            answer: answer,
            createdBy: user.id,
            question: question,
            createdAt: Date.now(),
          };
          let addNewAnswer = await global.models.GLOBAL.ANSWER.create(
            addAnswer
          );
          let lastMessageObj = {
            answerId: addNewAnswer._id,
            answer: addNewAnswer.answer,
          };

          newAnswer = await global.models.GLOBAL.ANSWER.findOne({
            _id: addNewAnswer._id,
          }).populate({
            path: "createdBy",
            model: "user",
            select:
              "_id name subject profileImage currentRole countryOfResidence",
          });
          let addLastMessage =
            await global.models.GLOBAL.ANSWER_ROOM.findOneAndUpdate(
              {
                _id: roomId,
              },
              { $set: { lastMessage: lastMessageObj } },
              { new: true }
            );
          // console.log("here in if--->", newAnswer);
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
            userId: user._id,
            receiverId: findQuestion.createdBy,
            title: `Notification By ${user._id} to ${findQuestion.createdBy}`,
            description: ` Give Answer to Your Question's ${findQuestion.question}`,
            createdBy: user._id,
            updatedBy: user._id,
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
            message: messages.ITEM_NOT_FOUND,
            payload: {},
            logPayload: false,
          };
          return data4createResponseObject;
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
      return data4createResponseObject;
    }
  },
};
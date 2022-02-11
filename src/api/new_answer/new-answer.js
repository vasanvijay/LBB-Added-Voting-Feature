const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const { sendPushNotification } = require("../../middlewares/pushNotification");

// Add Answer
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { question, answer, roomId } = req;
    let user = await utils.getHeaderFromToken(req.user);
    // console.log("USER--->>", user);
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
            createdAt: Date.now(),
          };
          console.log("lastMessageObj--->>", lastMessageObj);
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
          const updatedQue = await global.models.GLOBAL.QUESTION.updateOne(
            { _id: question, createdBy: { $nin: user.id } },
            { $inc: { response: 1 } },
            { new: true }
          );
          console.log("updatedQue--->>", updatedQue);
          console.log("USERRRRRRRR---->", user);
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
            description: {
              data: { title: "Leaderbridge" },
              notification: {
                title: "Give Answer to your question!!!",
                body: ` Give Answer to Your Question's ${findQuestion.question}`,
              },
            },
            createdBy: user.id,
            updatedBy: user.id,
            question: question,
            createdAt: Date.now(),
          };
          let findToken = await global.models.GLOBAL.USER.findOne({
            _id: findQuestion.createdBy,
          });
          let notification = await global.models.GLOBAL.NOTIFICATION.create(
            ntfObj
          );
          try {
            if (findToken.deviceToken !== "1234") {
              let data = {
                payload: ntfObj.description,
                firebaseToken: findToken.deviceToken,
              };
              sendPushNotification(data);
              res.status(200).send({
                msg: "Notification sent successfully!",
              });
            }
            res.status(200).send({
              msg: "Notification sent successfully!",
            });
          } catch (e) {
            res.status(500).send({
              msg: "Unable to send notification!",
            });
          }

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

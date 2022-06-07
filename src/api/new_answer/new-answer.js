const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const { sendPushNotification } = require("../../middlewares/pushNotification");
const { ObjectId } = require("mongodb");

// Add Answer
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { question, answer, roomId, status, user_type } = req;
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

      console.log("====-=-", findQuestion);
      let everyoneAnswer = await global.models.GLOBAL.ANSWER.find({
        question: ObjectId(question),
        createdBy: ObjectId(user.id),
        status: 0,
      });
      console.log("EVERYONE-ANSWER", everyoneAnswer);
      if (findQuestion) {
        let findRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
          _id: roomId,
        });
        console.log("FIND-ROOM", findRoom);
        if (findRoom) {
          let addAnswer;
          addAnswer = {
            roomId: roomId,
            answer: answer,
            createdBy: user.id,
            question: question,
            createdAt: Date.now(),
            status: status,
            user_type: user_type,
          };

          let addNewAnswer = await global.models.GLOBAL.ANSWER.create(
            addAnswer
          );
          // let updateAnswer = await global.models.GLOBAL.ANSWER.updateMany
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

          await global.models.GLOBAL.USER.findOneAndUpdate(
            { _id: user.id },
            {
              $pull: {
                answerLater: question,
              },
            }
          );

          if (user.id != findQuestion.createdBy.toString()) {
            // console.log(
            //   user.id,
            //   findQuestion.createdBy,
            //   "-----------------vishv----------"
            // );

            let ntfObj = {
              userId: user.id,
              receiverId: findQuestion.createdBy,
              title: `Notification By ${user.id} to ${findQuestion.createdBy}`,
              description: {
                data: { title: "Leaderbridge" },
                notification: {
                  title: "Give Answer to your question!!!",
                  body: `A ${user.currentRole} replied to your answer`,
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

            console.log("notification--->>@@@@", findToken);
            try {
              if (findToken.deviceToken) {
                let data = {
                  payload: ntfObj.description,
                  firebaseToken: findToken.deviceToken,
                };

                console.log("data--->>", data);

                sendPushNotification(data);
                // res?.status(200).send({
                //   msg: "Notification sent successfully!",
                // });
              }
              // res.status(200).send({
              //   msg: "Notification sent successfully!",
              // });
            } catch (e) {
              // res.status(500).send({
              //   msg: "Unable to send notification!",
              // });
              console.log("e--->>", e);
            }
          } else {
            let findParticipants =
              await global.models.GLOBAL.ANSWER_ROOM.aggregate([
                {
                  $match: {
                    _id: roomId,
                  },
                },
                {
                  $unwind: {
                    path: "$participateIds",
                  },
                },
                {
                  $match: {
                    participateIds: {
                      $nin: [question, findQuestion.createdBy],
                    },
                  },
                },
              ]);

            let ntfObj2 = {
              userId: user.id,
              receiverId: findRoom.createdBy,
              title: `Notification By ${user.id} to ${findQuestion.createdBy}`,
              description: {
                data: { title: "Leaderbridge" },
                notification: {
                  title: "Give Answer to your question!!!",
                  body: `Replied To Your Question  ${findQuestion.question}`,
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
              ntfObj2
            );

            console.log("#########################!", notification);
            try {
              if (findToken.deviceToken !== "1234") {
                console.log("###########", findToken);
                let data = {
                  payload: ntfObj2.description,
                  firebaseToken: findToken.deviceToken,
                };
                sendPushNotification(data);
                // ss
              }
              // res.status(200).send({
              //   msg: "Notification sent successfully!",
              // });
            } catch (e) {
              // res.status(500).send({
              //   msg: "Unable to send notification!",
              // });
              console.log("e--->>", e);
            }
          }

          const data4createResponseObject = {
            // req: req,
            result: 0,
            message: messages.ITEM_INSERTED,
            payload: { answer: newAnswer },
            logPayload: false,
          };
          return data4createResponseObject;
        } else {
          const data4createResponseObject = {
            // req: req,
            result: -1,
            message: messages.ITEM_NOT_FOUND,
            payload: {},
            logPayload: false,
          };
          return data4createResponseObject;
        }
      }
    } catch (error) {
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
    }
  },
};

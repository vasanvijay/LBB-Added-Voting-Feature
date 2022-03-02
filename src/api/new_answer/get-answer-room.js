const { ObjectId } = require("mongodb");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      // let { user } = req;

      let user = await utils.getHeaderFromToken(req.user);
      let { question } = req;
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: ObjectId(question),
      });
      // // console.log("QUE-->>", findQuestion);
      if (findQuestion) {
        const id = question;
        const answerBy = user.id;
        const questionBy = findQuestion.createdBy;

        let participateIds = [];
        participateIds.push(answerBy);
        participateIds.push(id);
        participateIds.push(questionBy);

        let findAnswerRoom = await global.models.GLOBAL.ANSWER_ROOM.find({
          participateIds: {
            $size: participateIds.length,
            $all: [...participateIds],
          },
        }).populate({
          path: "createdBy",
          model: "user",
          select:
            "_id name subject profileImage currentRole email blockUser region",
        });

        // // console.log("findAnswerRoom---->", findAnswerRoom);

        for (let i = 0; i < findAnswerRoom.length; i++) {
          let answerById = await global.models.GLOBAL.ANSWER.find({
            roomId: findAnswerRoom[i]._id,
          }).sort({ createdAt: -1 });
          // // console.log("answerById---->", answerById);
        }

        // const isFriend = await global.models.GLOBAL.USER.findOne({
        //   _id: user.id,
        //   accepted: findRoom.createdBy,
        // });

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_FETCHED,
          payload: {
            room: findAnswerRoom,
          },
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

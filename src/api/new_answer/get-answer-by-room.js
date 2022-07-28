const { ObjectId } = require("mongodb");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      let user = await utils.getHeaderFromToken(req.user);
      console.log("user--------------------------------------", req.question);
      let findUser = await global.models.GLOBAL.USER.findOne({ _id: user.id });
      let abuseAnswerData = [];
      for (let i = 0; i < findUser.abuseAnswer.length; i++) {
        abuseAnswerData.push(ObjectId(findUser.abuseAnswer[i].answerId));
      }
      let { roomId, roomListId, roomMakeid } = req;
      console.log("roomId--------12-122222----", roomId);
      // let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
      //   _id: roomId,
      // });

      if (roomId && !roomListId && roomMakeid) {
        let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
          _id: roomId,
        });

        console.log("@@@@@@@@@@@@@@@@@", findQuestion);
        let body = { status: 0 };
        if (findQuestion.createdBy == user.id) {
          body = {};
        }
        let findRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
          questionId: ObjectId(roomId),
        });
        if (findRoom) {
          let findAnswer = await global.models.GLOBAL.ANSWER.find({
            question: ObjectId(roomId),
          }).populate({
            path: "createdBy",
            model: "user",
            select: "_id name subject profileImage currentRole countryOfResidence",
          });
          // console.log("1st <==============>", findAnswer);
          findAnswer = await global.models.GLOBAL.ANSWER.aggregate([
            {
              $match: {
                question: ObjectId(roomId),
                _id: { $nin: abuseAnswerData },
              },
            },
            {
              $lookup: {
                from: "user",
                localField: "createdBy",
                foreignField: "_id",
                as: "createdBy",
              },
            },
            {
              $unwind: {
                path: "$createdBy",
              },
            },
            {
              $project: {
                "createdBy.password": 0,
              },
            },
            {
              $facet: {
                myans: [
                  {
                    $match: {
                      "createdBy._id": ObjectId(user.id),
                    },
                  },
                ],
                allans: [
                  {
                    $match: {
                      "createdBy._id": {
                        $ne: ObjectId(user.id),
                      },
                      ...body,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                all: {
                  $setUnion: ["$myans", "$allans"],
                },
              },
            },
            {
              $unwind: {
                path: "$all",
              },
            },
            {
              $project: {
                _id: "$all._id",
                isUpdated: "$all.isUpdated",
                isAbuse: "$all.isAbuse",
                isStar: "$all.isStar",
                roomId: "$all.roomId",
                answer: "$all.answer",
                rating: "$all.rating",
                upVote: "$all.upVote",
                downVote: "$all.downVote",
                createdBy: "$all.createdBy",
                question: "$all.question",
                createdAt: "$all.createdAt",
                __v: "$all.__v",
                status: "$all.status",
              },
            },
            {
              $sort: {
                createdAt: 1,
              },
            },
          ]);

          // .populate({
          //   path: "createdBy",
          //   model: "user",
          //   select:
          //     "_id name subject profileImage currentRole countryOfResidence",
          // });

          if (!findAnswer.length < 0) {
            const data4createResponseObject = {
              req: req,
              result: -1,
              message: messages.GENERAL,
              payload: {},
              logPayload: false,
            };
            return data4createResponseObject;
          } else {
            let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
              _id: findRoom.questionId,
            });

            if (findQuestion.createdBy == user.id) {
              // let findRequest =
              //   await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
              //     $and: [
              //       { requestBy: user.id },
              //       { requestTo: findRoom.createdBy },
              //     ],
              //   }).populate({
              //     path: "requestBy",
              //     model: "user",
              //     select:
              //       "_id name email region currentRole subject profileImage countryOfResidence",
              //   });
              // let receivedRequest =
              //   await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
              //     $and: [
              //       { requestBy: findRoom.createdBy },
              //       { requestTo: user.id },
              //     ],
              //   }).populate({
              //     path: "requestTo",
              //     model: "user",
              //     select:
              //       "_id name email region currentRole subject profileImage countryOfResidence",
              //   });
              let findRequest = await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
                roomId: ObjectId(roomMakeid),
              })
                .populate({
                  path: "requestTo",
                  model: "user",
                  select: "_id name email region currentRole subject profileImage countryOfResidence",
                })
                .populate({
                  path: "requestBy",
                  model: "user",
                  select: "_id name email region currentRole subject profileImage countryOfResidence",
                });

              let checkRequest = await global.models.GLOBAL.CONNECTION.findOne({
                senderId: user.id,
                receiverId: findRoom.createdBy,
              });

              let isFriend;
              if (checkRequest) {
                isFriend = "pending";
              } else {
                const checkRequestProfile = await global.models.GLOBAL.USER.findOne({
                  _id: user.id,
                  accepted: findRoom.createdBy,
                });

                isFriend = checkRequestProfile == null ? "false" : "true";
              }

              console.log("findQuestion", findQuestion);

              const data4createResponseObject = {
                req: req,
                result: 0,
                message: messages.ITEM_FETCHED,
                payload: {
                  answer: findAnswer,
                  request: findRequest,
                  isFriend: isFriend,
                  response: findQuestion?.response,
                },
                logPayload: false,
              };
              return data4createResponseObject;
            } else {
              // let findRequest =
              //   await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
              //     $and: [
              //       { requestBy: user.id },
              //       { requestTo: findQuestion.createdBy },
              //     ],
              //   }).populate({
              //     path: "requestBy",
              //     model: "user",
              //     select:
              //       "_id name email region currentRole subject profileImage countryOfResidence",
              //   });
              // let receivedRequest =
              //   await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
              //     $and: [
              //       { requestBy: findQuestion.createdBy },
              //       { requestTo: user.id },
              //     ],
              //   }).populate({
              //     path: "requestTo",
              //     model: "user",
              //     select:
              //       "_id name email region currentRole subject profileImage countryOfResidence",
              //   });
              let findRequest = await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
                roomId: ObjectId(roomMakeid),
              })
                .populate({
                  path: "requestTo",
                  model: "user",
                  select: "_id name email region currentRole subject profileImage countryOfResidence",
                })
                .populate({
                  path: "requestBy",
                  model: "user",
                  select: "_id name email region currentRole subject profileImage countryOfResidence",
                });

              let checkRequest = await global.models.GLOBAL.CONNECTION.findOne({
                senderId: user.id,
                receiverId: findRoom.createdBy,
              });
              let isFriend;
              if (checkRequest) {
                isFriend = "pending";
              } else {
                const checkRequestProfile = await global.models.GLOBAL.USER.findOne({
                  _id: user.id,
                  accepted: findRoom.createdBy,
                });

                isFriend = checkRequestProfile == null ? "false" : "true";
              }
              const data4createResponseObject = {
                req: req,
                result: 0,
                message: messages.ITEM_FETCHED,
                payload: {
                  answer: findAnswer,
                  request: findRequest,
                  isFriend: isFriend,
                  response: findQuestion?.response,
                },
                logPayload: false,
              };
              return data4createResponseObject;
            }
          }
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
      } else if (!roomId && roomListId && roomMakeid) {
        let findRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
          _id: ObjectId(roomListId),
        });
        if (findRoom) {
          let findAnswer = await global.models.GLOBAL.ANSWER.find({
            roomId: ObjectId(roomListId),
          }).populate({
            path: "createdBy",
            model: "user",
            select: "_id name subject profileImage currentRole countryOfResidence",
          });

          if (!findAnswer.length < 0) {
            const data4createResponseObject = {
              req: req,
              result: -1,
              message: messages.GENERAL,
              payload: {},
              logPayload: false,
            };
            return data4createResponseObject;
          } else {
            let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
              _id: findRoom.questionId,
            });
            if (findQuestion.createdBy == user.id) {
              // let findRequest =
              //   await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
              //     $and: [
              //       { requestBy: user.id },
              //       { requestTo: findRoom.createdBy },
              //     ],
              //   }).populate({
              //     path: "requestBy",
              //     model: "user",
              //     select:
              //       "_id name email region currentRole subject profileImage countryOfResidence",
              //   });
              // let receivedRequest =
              //   await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
              //     $and: [
              //       { requestBy: findRoom.createdBy },
              //       { requestTo: user.id },
              //     ],
              //   }).populate({
              //     path: "requestTo",
              //     model: "user",
              //     select:
              //       "_id name email region currentRole subject profileImage countryOfResidence",
              //   });
              let findRequest = await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
                roomId: ObjectId(roomMakeid),
              })
                .populate({
                  path: "requestTo",
                  model: "user",
                  select: "_id name email region currentRole subject profileImage countryOfResidence",
                })
                .populate({
                  path: "requestBy",
                  model: "user",
                  select: "_id name email region currentRole subject profileImage countryOfResidence",
                });

              let checkRequest = await global.models.GLOBAL.CONNECTION.findOne({
                senderId: user.id,
                receiverId: findRoom.createdBy,
              });

              let isFriend;
              if (checkRequest) {
                isFriend = "pending";
              } else {
                const checkRequestProfile = await global.models.GLOBAL.USER.findOne({
                  _id: user.id,
                  accepted: findRoom.createdBy,
                });

                isFriend = checkRequestProfile == null ? "false" : "true";
              }

              const data4createResponseObject = {
                req: req,
                result: 0,
                message: messages.ITEM_FETCHED,
                payload: {
                  answer: findAnswer,
                  request: findRequest,
                  isFriend: isFriend,
                  response: findQuestion?.response,
                },
                logPayload: false,
              };
              return data4createResponseObject;
            } else {
              // let findRequest =
              //   await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
              //     $and: [
              //       { requestBy: user.id },
              //       { requestTo: findQuestion.createdBy },
              //     ],
              //   }).populate({
              //     path: "requestBy",
              //     model: "user",
              //     select:
              //       "_id name email region currentRole subject profileImage countryOfResidence",
              //   });
              // let receivedRequest =
              //   await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
              //     $and: [
              //       { requestBy: findQuestion.createdBy },
              //       { requestTo: user.id },
              //     ],
              //   }).populate({
              //     path: "requestTo",
              //     model: "user",
              //     select:
              //       "_id name email region currentRole subject profileImage countryOfResidence",
              //   });
              let findRequest = await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
                roomId: ObjectId(roomMakeid),
              })
                .populate({
                  path: "requestTo",
                  model: "user",
                  select: "_id name email region currentRole subject profileImage countryOfResidence",
                })
                .populate({
                  path: "requestBy",
                  model: "user",
                  select: "_id name email region currentRole subject profileImage countryOfResidence",
                });

              let checkRequest = await global.models.GLOBAL.CONNECTION.findOne({
                senderId: user.id,
                receiverId: findRoom.createdBy,
              });
              let isFriend;
              if (checkRequest) {
                isFriend = "pending";
              } else {
                const checkRequestProfile = await global.models.GLOBAL.USER.findOne({
                  _id: user.id,
                  accepted: findRoom.createdBy,
                });

                isFriend = checkRequestProfile == null ? "false" : "true";
              }
              const data4createResponseObject = {
                req: req,
                result: 0,
                message: messages.ITEM_FETCHED,
                payload: {
                  answer: findAnswer,
                  request: findRequest,
                  isFriend: isFriend,
                  response: findQuestion?.response,
                },
                logPayload: false,
              };
              return data4createResponseObject;
            }
          }
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
      logger.error(`${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`);
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

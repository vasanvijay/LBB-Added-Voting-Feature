"use strict";
const activeUsers = new Set();
const onlineUsers = {};
const chatCtrl = require("../api/chat");
const answerCtrl = require("../api/new_answer");
const { sendPushNotification } = require("../middlewares/pushNotification");
const api4Connection = require("../../../leaderbridge-backend/src/api/connection/index");
const api4Notification = require("../../../leaderbridge-backend/src/api/notification/index");
const api4User = require("../../../leaderbridge-backend/src/api/user/index");
const api4Question = require("../../../leaderbridge-backend/src/api/question/index");
const api4Answer = require("../../../leaderbridge-backend/src/api/answer/index");
const { ObjectId } = require("mongodb");
module.exports = (server, logger) => {
  logger.info("Socket.io server started");
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    // logger.info(
    //   `REQ [${socket.id}] [WS] ${socket.handshake.url} ${JSON.stringify(
    //     socket.handshake
    //   )}`
    // );
    next();
  });

  io.on("connection", (socket) => {
    // console.log("User connected", socket.id);
    // logger.info(
    //   `CONN [${socket.id}] [WS] ${socket.handshake.url} ${JSON.stringify(
    //     socket.handshake
    //   )}`
    // );

    // Routes
    socket.on("login", async function ({ userId }) {
      // console.log("login--->>1111111111111111111", userId);
      // console.log("a user " + userId + " connected");
      // saving userId to object with socket ID
      onlineUsers[socket.id] = userId;
      // console.log("onlineUsers", onlineUsers);
      const userStatus = await api4User.updateOnlineStatus.handler({
        userId,
        status: true,
      });
      // console.log(
      //   "---------------------1-----------------",
      //   userId,
      //   userStatus
      // );
    });

    //

    socket.on("disconnect", async () => {
      // console.log("user " + onlineUsers[socket.id] + " disconnected");
      // remove saved socket from onlineUsers object
      let userId = onlineUsers[socket.id];

      // console.log("-----2------", onlineUsers);
      // console.log("-----2------", userId);
      const userStatus = await api4User.updateOnlineStatus.handler({
        userId,
        status: false,
      });
      // console.log("userrrrStatussss", userStatus);
      // // delete onlineUsers[socket.id];
    });
    socket.on("leaveRoom", async ({ roomId }) => {
      // console.log("leaveRoom", roomId);
      socket.leave(roomId);
    });

    // console.log("onlineUsers----global", onlineUsers);
    socket.on("join", async function ({ roomId, user }) {
      logger.info(`user join room : ${roomId}`);
      socket.userId = roomId;

      socket.join(roomId);

      try {
        if (roomId) {
          let chatHistory;
          // let ln = await io.in(roomId).allSockets();

          // if (ln.size == 2) {
          //   chatHistory = await chatCtrl.getMessages.handler(
          //     roomId,
          //     user,
          //     "user"
          //   );
          // } else {
          chatHistory = await chatCtrl.getMessages.handler(roomId, user);
          // }

          // console.log(
          //   "chatHistory--->>",
          //   roomId,

          //   user,
          //   chatHistory.payload.chats[chatHistory.payload.chats.length - 1]
          // );
          // console.log("////////////////history", chatHistory.payload);
          if (chatHistory.payload && chatHistory.payload.chats) {
            io.in(roomId).emit("history", { chats: chatHistory.payload });
          } else {
            io.in(roomId).emit("history", {});
          }
          // console.log("history sent");
          // console.log(
          //   "%%%%%%%%%%%%%%%%&&&&&&&&&&&_________________________&&&&&&&&&&&&&&&&&&&&message-sent",
          //   user,
          //   roomId
          // );
        }
      } catch (error) {
        console.log("Error in finding Chats ", error);
      }
    });

    socket.on("last-message", async function (user) {
      // console.log("LAST MESSAGE------------->>>>>>", user);
      try {
        let lastMessage = await chatCtrl.lastMessage.handler(user);
        // console.log("history", chatHistory.payload.chats);
        io.in(socket.id).emit("last-message", {
          chats: lastMessage.payload.chats,
        });
        console.log("last-message data sent");
      } catch (error) {
        console.log("Error in finding Chats ", error);
      }
    });

    socket.on("chat-room", async function (user) {
      console.log("LAST MESSAGE------------->>>>>>", user);
      try {
        let allChatRoom = await chatCtrl.allChatRoom.handler(user);
        // console.log("history", allChatRoom.payload.room);
        io.in(socket.id).emit("chat-room", {
          room: allChatRoom.payload.room,
          userId: allChatRoom.payload.userId,
        });
        console.log("Room data sent");
      } catch (error) {
        console.log("Error in finding Room ", error);
      }
    });

    socket.on(
      "new-message",
      async function ({ roomId, sender, message, type, parentMessageId }) {
        // console.log({ roomId, sender, message, parentMessageId });
        try {
          console.log(
            "%%%%%%%%%%%%%%%%&&&&&&&&&&&_________________________&&&&&&&&&&&&&&&&&&&&message-sent",
            sender,
            roomId
          );
          let ln = await io.in(roomId).allSockets();
          let newMsg;
          if (ln.size == 2) {
            newMsg = await chatCtrl.sendMessage.handler({
              roomId: roomId,
              sender: sender,
              message: message,
              type: type,
              parentMessageId: parentMessageId,
              flag: "seen",
            });
          } else {
            newMsg = await chatCtrl.sendMessage.handler({
              roomId: roomId,
              sender: sender,
              message: message,
              type: type,
              parentMessageId: parentMessageId,
            });
          }

          // newMsg = JSON.parse(JSON.stringify(newMsg));
          // newMsg["network"] = "1"
          // console.log("new-message", newMsg.payload.newChat);

          io.in(roomId).emit("new-message", newMsg.payload.newChat);
          io.emit("check-answer");

          let chatHistory = await chatCtrl.getMessages.handler(roomId);
          // console.log("history", chatHistory.payload.chats);
          io.in(socket.id).emit("history", {
            chats: chatHistory.payload.chats,
          });
          io.emit("check-answer");
        } catch (error) {
          console.log("Error in sending message", error.message);
        }
      }
    );

    socket.on("answer-room", async function (user, question) {
      // console.log("answer-room------------->>>>>>", user);
      try {
        let answerRoom = await answerCtrl.getAnswerRoom.handler(user, question);
        // console.log("ROOM--->>>", answerRoom.payload.room);
        io.in(socket.id).emit("answer-room", answerRoom.payload.room);
        console.log("room data sent");
      } catch (error) {
        console.log("Error in finding Chats ", error);
      }
    });

    socket.on(
      "answer",
      async function ({ user, roomId, roomListId, roomMakeid }) {
        console.log("answer------------->>>>>>", user, roomId);
        try {
          let answer = await answerCtrl.getAnswerByRoom.handler({
            user: user,
            roomId: roomId,
            roomListId: roomListId,
            roomMakeid: roomMakeid,
          });
          // console.log("get----->>>", answer.payload);
          if (answer?.payload?.answer) {
            io.in(socket.id).emit("answer", answer.payload);
            console.log("answer data sent");
          }
        } catch (error) {
          console.log("Error in finding Chats ", error);
        }
      }
    );

    socket.on(
      "add-answer",
      async function ({ user, question, answer, roomId, status, user_type }) {
        // console.log("add-answer------------->>>>>>", user);
        try {
          let addAnswer = await answerCtrl.newAnswer.handler({
            user: user,
            question: question,
            answer: answer,
            roomId: roomId,
            status: status,
            user_type: user_type,
          });
          // console.log("addAnswer Socket---->>", addAnswer.payload.answer);
          io.in(socket.id).emit("add-answer", addAnswer.payload.answer);
          io.emit("check-answer");
          const notification =
            await api4Notification.getNotificationCount.handler({
              user,
            });

          io.emit("get-notification-count-request", { notification: true });
          io.emit("get-notification-request", { notification: true });
        } catch (error) {
          console.log("Error in adding Answer ", error);
        }
      }
    );

    // New Request in Answer
    socket.on("request", async function ({ user, question, roomId }) {
      // console.log("add-answer------------->>>>>>", user);
      try {
        let addRequest = await answerCtrl.requestProfile.handler({
          user: user,
          question: question,
          roomId: roomId,
        });
        console.log("Request Socket---->>", addRequest.payload.newRequest);
        io.in(socket.id).emit("request", addRequest.payload.newRequest);
        io.emit("check-answer");
        console.log("request add success.");
      } catch (error) {
        console.log("Error in adding request ", error);
      }
    });

    // New Request in See-Answer
    socket.on("new-request", async function ({ user, id, roomId }) {
      // console.log("add-answer------------->>>>>>", user);
      try {
        let addNewRequest = await answerCtrl.requestProfileInSeeAns.handler({
          user: user,
          id: id,
          roomId: roomId,
        });
        console.log(
          "New Request Socket---->>",
          addNewRequest.payload.newRequest
        );
        io.in(socket.id).emit("new-request", addNewRequest.payload.newRequest);
        io.emit("check-answer");
        console.log("request add success.");
      } catch (error) {
        console.log("Error in adding request ", error);
      }
    });

    // New Request in Chat
    socket.on(
      "new-request-chat",
      async function ({ user, id, roomId, typeOfRequest }) {
        // console.log("add-answer------------->>>>>>", user);
        try {
          let addNewRequestInChat = await chatCtrl.requestProfile.handler({
            user: user,
            id: id,
            roomId: roomId,
            typeOfRequest: typeOfRequest,
          });
          console.log(
            "addNewRequestInChat----->",
            addNewRequestInChat.payload.newRequest
          );
          io.in(socket.id).emit(
            "new-request-chat",
            addNewRequestInChat.payload.newRequest
          );
          io.emit("check-answer");
          console.log("request add success.");
        } catch (error) {
          console.log("Error in adding request ", error);
        }
      }
    );

    //Accept Request in Answer
    socket.on(
      "accept-request",
      async function ({ user, requestId, questionId }) {
        // console.log("add-answer------------->>>>>>", user);
        try {
          let aacceptRequest = await answerCtrl.acceptRequest.handler({
            user: user,
            requestId: requestId,
            questionId: questionId,
          });
          console.log(
            "Accept Request Socket---->>",
            aacceptRequest.payload.updateRequest
          );
          io.in(socket.id).emit(
            "accept-request",
            aacceptRequest.payload.updateRequest
          );
          io.emit("check-answer");
          console.log("request accepted successfully.");
        } catch (error) {
          console.log("Error in accepting request ", error);
        }
      }
    );

    //Accept Request in Chat
    socket.on(
      "accept-request-chat",
      async function ({ user, requestId, status }) {
        try {
          let aacceptRequest = await chatCtrl.acceptRequest.handler({
            user: user,

            requestId: requestId,
            status: status,
          });
          console.log(
            "Accept Request in Chat Socket---->>",
            aacceptRequest.payload.updateRequest
          );
          io.in(socket.id).emit(
            "accept-request-chat",
            aacceptRequest.payload.updateRequest
          );
          io.emit("check-answer");
          console.log("request accepted successfully.");
        } catch (error) {
          console.log("Error in accepting request ", error);
        }
      }
    );

    //Decline Request in Answer
    socket.on(
      "decline-request",
      async function ({ user, requestId, questionId }) {
        // console.log("add-answer------------->>>>>>", user);
        try {
          let declineRequest = await answerCtrl.declineRequest.handler({
            user: user,
            requestId: requestId,
            questionId: questionId,
          });
          console.log(
            "decline Request Socket---->>",
            declineRequest.payload.updateRequest
          );
          io.in(socket.id).emit(
            "decline-request",
            declineRequest.payload.updateRequest
          );
          io.emit("check-answer");
          console.log("request reject successfully.");
        } catch (error) {
          console.log("Error in declining request ", error);
        }
      }
    );

    //Decline Request in Chat
    socket.on("decline-request-chat", async function ({ user, requestId }) {
      // console.log("add-answer------------->>>>>>", user);
      try {
        let declineRequest = await chatCtrl.declineRequest.handler({
          user: user,
          requestId: requestId,
        });
        console.log(
          "Decline Request in Chat Socket---->>",
          declineRequest.payload.updateRequest
        );
        io.in(socket.id).emit(
          "decline-request-chat",
          declineRequest.payload.updateRequest
        );
        io.emit("check-answer");
        console.log("request rejected successfully.");
      } catch (error) {
        console.log("Error in declining request ", error);
      }
    });

    // Socket "Join-Profile"
    socket.on("join-profile", async function ({ profileId }) {
      socket.profileId = String(profileId);
      activeUsers.add(String(profileId));
      socket.join(String(profileId));
      console.log("join-profile");
      io.in(socket.id).emit("user join profile");
    });

    // Socket "Call Connect"
    socket.on(
      "connectCall",
      async function ({ channelName, otherId, isForVideoCall, token }) {
        console.log("channelname on connectcall...", channelName);
        console.log("otherid on connectcall...", otherId);
        console.log("token on connectcall...", token);
        let findToken = await global.models.GLOBAL.USER.findOne({
          _id: otherId,
        });
        delete findToken.password;
        let loginUser = await global.models.GLOBAL.USER.findOne({
          _id: channelName,
        });
        delete loginUser.password;
        console.log("findToken", findToken);
        const desc = {
          data: { title: "Leaderbridge" },
          notification: {
            title: "New Call notification",
            body: `Someone is calling`,
          },
        };

        if (findToken.deviceToken !== "1234") {
          let data = {
            payload: desc,
            firebaseToken: findToken.deviceToken,
          };
          sendPushNotification(data);
        }
        if (token) {
          let data = {
            msg: "call Requested",
            channelName: String(channelName),
            otherId: String(otherId),
            isForVideoCall: Boolean(isForVideoCall),
            token: token,
            otherUser: findToken,
            loginUser: loginUser,
          };
          io.in(String(channelName)).emit("onCallRequest", data);
          io.in(String(otherId)).emit("onCallRequest", data);
          console.log("data on connectcall...", data);
        }
      }
    );

    //  socket "acceptCall"
    socket.on(
      "acceptCall",
      async function ({ channelName, otherId, isForVideoCall, token }) {
        console.log("chanel name................. Accept", channelName);
        console.log("otherId............++++++++++Accept", otherId);
        console.log("isForVideoCall------------->", isForVideoCall);
        console.log("token...........++++++++++++ accept", token);
        const res = {
          msg: "call accepted",
          channelName: String(channelName),
          otherId: String(otherId),
          isForVideoCall: Boolean(isForVideoCall),
          token: token,
        };
        io.in(String(channelName)).emit("onAcceptCall", res);
        io.in(String(otherId)).emit("onAcceptCall", res);
        console.log("channelNameonAcceptCall...................", res);
        console.log("otherIdonAcceptCall...................", res);
      }
    );

    // Socket "Call Reject"
    socket.on(
      "rejectCall",
      async function ({ channelName, otherId, isForVideoCall, token }) {
        const res = {
          msg: "call disconnected",
          channelName: String(channelName),
          otherId: String(otherId),
          isForVideoCall: Boolean(isForVideoCall),
          token: token,
        };
        io.in(String(channelName)).emit("onRejectCall", res);
        io.in(String(otherId)).emit("onRejectCall", res);
      }
    );

    socket.on("delete-answer", async function ({ answerId }) {
      // let deleteAnswer = await api4Answer.deleteAnswer.handler({
      //   answerId: answerId,
      // });

      // delete answer from answer collection

      if (!answerId) {
        const data4createResponseObject = {
          // req: req,
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
        const answerExists = await global.models.GLOBAL.ANSWER.findOne({
          _id: answerId,
        });
        // console.log("USER---->>", user._id);
        // console.log("ANS---->>>", answerExists);
        let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
          _id: answerExists.question,
        });
        if (findQuestion) {
          const deleteAnswer =
            await global.models.GLOBAL.ANSWER.findOneAndRemove({
              _id: answerId,
            });

          const getLastAnswer = await global.models.GLOBAL.ANSWER.findOne({
            question: findQuestion._id,
          }).sort({ createdAt: -1 });

          let lastMessageObj = {
            answerId: getLastAnswer._id,
            answer: getLastAnswer.answer,
            createdAt: Date.now(),
          };

          await global.models.GLOBAL.ANSWER_ROOM.findOneAndUpdate(
            {
              // _id:roomId,
              _id: getLastAnswer.roomId,
            },
            { $set: { lastMessage: lastMessageObj } },
            { new: true }
          );

          const decreaseResponse =
            await global.models.GLOBAL.QUESTION.updateOne(
              { _id: findQuestion._id, createdBy: findQuestion.createdBy },
              { $inc: { response: -1 } },
              { new: true }
            );

          if (deleteAnswer) {
            const data4createResponseObject = {
              // req: req,
              result: 0,
              message: "Answer deleted successfully",
              payload: {},
              logPayload: false,
            };

            io.in(socket.id).emit("delete-answer", deleteAnswer);
            io.emit("check-answer");
            res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          } else {
            const data4createResponseObject = {
              // req: req,
              result: -1,
              message: messages.NOT_ALLOWED,
              payload: {},
              logPayload: false,
            };
            res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          }
        } else {
          const data4createResponseObject = {
            // req: req,
            result: -1,
            message: "Sorry, Something went wrong to delete answer.",
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }

        console.log("answer deleted successfully.");
      } catch (error) {
        logger.error(
          `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
        );
        const data4createResponseObject = {
          // req: req,
          result: -1,
          message: messages.GENERAL,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    });

    socket.on("edit-answer", async function ({ answerId, answer }) {
      if (!answerId) {
        const data4createResponseObject = {
          // req: req,
          result: -1,
          message: "Invalid parameters",
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.BAD_REQUEST)
          .json(utils.createResponseObject(data4createResponseObject));
      }
      try {
        const answerExists = await global.models.GLOBAL.ANSWER.findOne({
          _id: answerId,
        });

        let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
          _id: answerExists.question,
        });
        if (findQuestion) {
          const editAnswer = await global.models.GLOBAL.ANSWER.findOneAndUpdate(
            { _id: answerId },
            {
              $set: {
                answer: answer,
                isUpdated: true,
              },
            }
          );
          console.log("Answer Exists", editAnswer);

          if (editAnswer) {
            const data4createResponseObject = {
              // req: req,
              result: 0,
              message: "Answer edited successfully",
              payload: {},
              logPayload: false,
            };
            console.log("edit-answer", editAnswer);
            io.in(socket.id).emit("edit-answer", editAnswer);
            io.emit("check-answer");
            res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          } else {
            const data4createResponseObject = {
              // req: req,
              result: -1,
              message: "Sorry, Something went wrong to edit answer.",
              payload: {},
              logPayload: false,
            };
            res.status(enums.HTTP_CODES.OK);
          }
        }
      } catch (error) {
        logger.error(`Error encountered: ${error.message}\n${error.stack}`);
        const data4createResponseObject = {
          // req: req,
          result: -1,
          message: "Sorry, Something went wrong to edit answer.",
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    });

    socket.on("check-answer", async function () {});

    socket.on("star-messages", async function ({ messageId, userId, star }) {
      console.log("star-messages---------1", star);
      try {
        if (messageId) {
          let starMessage;
          if (star == true) {
            starMessage = await global.models.GLOBAL.CHAT.findByIdAndUpdate(
              {
                _id: messageId,
              },
              {
                isStar: true,

                $push: {
                  starredBy: userId,
                },
              },
              {
                new: true,
              }
            );
          } else {
            console.log("star-messages", star);
            starMessage = await global.models.GLOBAL.CHAT.findByIdAndUpdate(
              {
                _id: messageId,
              },
              {
                $set: {
                  isStar: false,
                },
                $pull: {
                  starredBy: userId,
                },
              },
              {
                new: true,
              }
            );
          }
          if (!starMessage) {
            const data4createResponseObject = {
              req: req,
              result: -1,
              message: messages.GENERAL,
              payload: {},
              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.BAD_REQUEST)
              .json(utils.createResponseObject(data4createResponseObject));
          } else {
            const data4createResponseObject = {
              req: req,
              result: 0,
              message: "MESSAGE STAR SUCCESSFULLY.",
              payload: { starMessage },
              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
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
    });

    socket.on("error", function (err) {
      console.log("received error from socket:", socket.id);
      console.log(err);
    });

    // conection connected

    socket.on("connection-connected", async function ({ user }) {
      console.log("connection-connected======", user);
      const conection = await api4Connection.getConnected.handler({ user });
      console.log("connection-connected", conection);
      io.in(socket.id).emit("connection-connected", {
        conection: conection,
      });
    });

    socket.on("connection-received", async function ({ user }) {
      console.log("connection-received======", user);
      const conection = await api4Connection.getConnectionreceived.handler({
        user,
      });
      console.log("connection-received", conection);
      io.in(socket.id).emit("connection-received", {
        conection: conection,
      });
    });

    socket.on("connection-received-sent", async function ({ user }) {
      console.log("connection-received-sent======", user);
      const conection = await api4Connection.getConnectionsent.handler({
        user,
      });
      console.log(
        "connection-received-sent=====================================",
        conection
      );
      io.in(socket.id).emit("connection-received-sent", {
        conection: conection,
      });
    });

    socket.on(
      "accept-connection",
      async function ({ user, accepted, receiverId, connectionId }) {
        console.log("accept-connection======", receiverId);
        const conection = await api4Connection.acceptConnection.handler({
          user,
          accepted,
          receiverId,
          connectionId,
        });
        console.log("accept-connection", conection);
        const conectionsent = await api4Connection.getConnectionsent.handler({
          user,
        });
        console.log(
          "connection-received-sent=====================================",
          conection
        );
        io.in(socket.id).emit("connection-received-sent", {
          conection: conectionsent,
        });
        const conectionreceived =
          await api4Connection.getConnectionreceived.handler({
            user,
          });
        console.log("connection-received", conection);
        io.in(socket.id).emit("connection-received", {
          conection: conectionreceived,
        });
        const conectionConected = await api4Connection.getConnected.handler({
          user,
        });
        console.log("connection-connected", conection);
        io.in(socket.id).emit("connection-connected", {
          conection: conectionConected,
        });
        io.in(socket.id).emit("accept-connection", {
          conection: conection,
        });
      }
    );

    socket.on(
      "decline-connection",
      async function ({ user, senderId, connectionId }) {
        const conection = await api4Connection.diclineConnection.handler({
          user,
          senderId,
          connectionId,
        });
        // console.log("accept-connection", conection)
        const conectionsent = await api4Connection.getConnectionsent.handler({
          user,
        });

        io.in(socket.id).emit("connection-received-sent", {
          conection: conectionsent,
        });
        const conectionreceived =
          await api4Connection.getConnectionreceived.handler({
            user,
          });
        console.log("connection-received", conection);
        io.in(socket.id).emit("connection-received", {
          conection: conectionreceived,
        });
        const conectionConected = await api4Connection.getConnected.handler({
          user,
        });
        io.emit("connection-received-sent", {
          conection: "get",
        });
        io.in(socket.id).emit("connection-connected", {
          conection: conectionConected,
        });
        io.in(socket.id).emit("decline-connection", {
          conection: conection,
        });
      }
    );

    socket.on("get-notification-request", async function ({ user }) {
      try {
        const notification = await api4Notification.getAllNotification.handler({
          user,
        });

        console.log("get-notification", notification);
        io.in(socket.id).emit("get-notification", {
          notification: notification,
        });
      } catch (error) {
        console.log("get-notification", error);
      }
    });
    socket.on("change-notification-status", async function ({ user, status }) {
      try {
        await api4Notification.getAllNotification.handler({
          user,
          status,
        });
        const notification =
          await api4Notification.getNotificationCount.handler({
            user,
          });

        console.log("get-notification-count", notification);
        io.in(socket.id).emit("get-notification-count", {
          notification: notification,
        });
      } catch (error) {
        console.log("get-notification", error);
      }
    });

    socket.on("get-notification-count-request", async function ({ user }) {
      console.log(
        "get-notification-count-requestcalledd------------------",
        user
      );
      try {
        const notificationCountData =
          await api4Notification.getNotificationCount.handler({
            user,
          });

        console.log(
          "get-notification-countcalled----------------",
          notificationCountData
        );
        io.in(socket.id).emit("get-notification-count", {
          notification: notificationCountData,
        });
      } catch (error) {
        console.log("get-notification-count", error);
      }
    });

    socket.on("block-user", async function ({ user, userId }) {
      const conection = await api4User.blockUser.handler({
        user,
        userId,
      });

      const conectionConected = await api4Connection.getConnected.handler({
        user,
      });
      io.in(socket.id).emit("connection-connected", {
        conection: conectionConected,
      });
      io.emit("connection-received-sent", {
        conection: "get",
      });

      io.in(socket.id).emit("block-user", {
        conection: conection,
      });

      // again check this is block user

      io.emit("get-block-status", {
        blockedUser: "get-block",
      });
    });

    socket.on("remove-user", async function ({ user, remove, removeId }) {
      const conection = await api4Connection.removeConnection.handler({
        user,
        remove,
        removeId,
      });
      console.log("accept-deeeeeee-connection", conection);

      const conectionConected = await api4Connection.getConnected.handler({
        user,
      });
      console.log(
        "ytytytytytytytyt==============",
        conectionConected.payload.connection
      );
      io.in(socket.id).emit("connection-connected", {
        conection: conectionConected,
      });
      io.in(socket.id).emit("remove-user", {
        conection: conection,
      });
    });

    socket.on("add-connection", async function ({ user, receiverId, message }) {
      const conection = await api4Connection.addConnection.handler({
        user,
        receiverId,
        message,
      });

      const conectionreceived =
        await api4Connection.getConnectionreceived.handler({
          user,
        });

      io.emit("connection-received", {
        conection: "get",
      });

      io.emit("connection-received-sent", {
        conection: "get",
      });

      io.in(socket.id).emit("add-connection", {
        conection: conection,
      });
    });

    socket.on("withdraw-request", async function ({ user, connectionId }) {
      const withdraw = await api4Connection.withdrawConnection.handler({
        user,
        connectionId,
      });

      io.in(socket.id).emit("withdraw-request", {
        conection: withdraw,
      });

      io.emit("connection-received-sent", {
        conection: "get",
      });

      io.emit("connection-received", {
        conection: "get",
      });

      console.log("withdraw-request", withdraw);
    });

    socket.on("unblock-user", async function ({ user, userId }) {
      const conection = await api4User.unBlockUser.handler({
        user,
        userId,
      });

      const conectionConected = await api4Connection.getConnected.handler({
        user,
      });
      io.in(socket.id).emit("connection-connected", {
        conection: conectionConected,
      });

      io.in(socket.id).emit("unblock-user", {
        conection: conection,
      });

      io.emit("get-block-user", {
        blockedUser: "get-block",
      });

      io.emit("get-block-status", {
        blockedUser: "get-block",
      });
    });

    socket.on("get-block-user", async function ({ user, query }) {
      console.log("get-block-user", user);
      const blockedUser = await api4User.getBlockuser.handler({
        user,
        query,
      });

      if (blockedUser?.payload?.blockUser.length > 0) {
        io.in(socket.id).emit("get-block-user", {
          blockedUser: blockedUser,
        });
      }
    });

    socket.on("unblock-user", async function ({ user, userId }) {
      console.log("unblock-user--------", userId);
      const unblock = await api4User.unBlockUser.handler({
        user,
        userId,
      });

      io.in(socket.id).emit("unblock-user", {
        connection: unblock,
      });
      io.emit("get-block-user", {
        blockedUser: "get-block",
      });
    });

    // get-block-user-status

    socket.on("get-block-status", async function ({ user, userId }) {
      const blockedUser = await api4User.getBlockstatus.handler({
        user,
        userId,
      });
      console.log("getBlockUser.payload------->", blockedUser.payload);
      io.in(socket.id).emit("get-block-status", {
        blockedUser: blockedUser,
      });
    });

    socket.on("answer-everyone", async function ({ user, questionId, status }) {
      const Everyone = await api4Answer.everyoneAnswer.handler({
        user,
        questionId,
        status,
      });
      io.in(socket.id).emit("who-can-see", {
        WhoSee: "get",
      });
      io.in(socket.id).emit("answer-everyone", {
        Everyone: Everyone,
      });
    });

    socket.on("answer-admin", async function ({ user, questionId, status }) {
      const AdminAnswer = await api4Answer.onlyAdmin.handler({
        user,
        questionId,
        status,
      });
      io.in(socket.id).emit("who-can-see", {
        WhoSee: "get",
      });
      io.in(socket.id).emit("answer-admin", {
        Admin: AdminAnswer,
      });
    });

    socket.on("who-can-see", async function ({ user, questionId }) {
      const WhoSee = await api4Answer.WhoCanseeAnswer.handler({
        user,
        questionId,
      });

      // console.log("who-can-see", WhoSee);
      io.in(socket.id).emit("who-can-see", {
        WhoSee: WhoSee,
      });
    });

    socket.on("answer-room-admin", async function ({ questionId }) {
      const AnswerRoomAdmin = await answerCtrl.getAnswerByRoomAdmin.handler({
        questionId,
      });

      console.log("answer-room-admin", AnswerRoomAdmin);
      io.in(socket.id).emit("answer-room-admin", {
        AnswerRoomAdmin: AnswerRoomAdmin,
      });
    });

    socket.on("get-answer-admin", async function ({ roomId }) {
      const AnswerRoomAdmin = await answerCtrl.getAnswerAdmin.handler({
        roomId,
      });

      console.log("get-answer-admin", AnswerRoomAdmin);
      io.in(socket.id).emit("get-answer-admin", {
        AnswerRoomAdmin: AnswerRoomAdmin,
      });
    });
  });
};

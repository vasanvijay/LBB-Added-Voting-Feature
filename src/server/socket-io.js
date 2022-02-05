"use strict";
const activeUsers = new Set();
const chatCtrl = require("../api/chat");
const answerCtrl = require("../api/new_answer");
const { sendPushNotification } = require("../middlewares/pushNotification");

module.exports = (server, logger) => {
  logger.info("Socket.io server started");
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    logger.info(
      `REQ [${socket.id}] [WS] ${socket.handshake.url} ${JSON.stringify(
        socket.handshake
      )}`
    );
    next();
  });

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);
    logger.info(
      `CONN [${socket.id}] [WS] ${socket.handshake.url} ${JSON.stringify(
        socket.handshake
      )}`
    );

    // Routes
    socket.on("join", async function ({ roomId, user }) {
      logger.info(`user join room : ${roomId}`);
      socket.userId = roomId;
      activeUsers.add(roomId);

      socket.join(roomId);

      try {
        let chatHistory = await chatCtrl.getMessages.handler(roomId, user);
        console.log("history", chatHistory.payload);
        if (chatHistory.payload && chatHistory.payload.chats) {
          io.in(socket.id).emit("history", { chats: chatHistory.payload });
        } else {
          io.in(socket.id).emit("history", {});
        }
        console.log("history sent");
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
          let newMsg = await chatCtrl.sendMessage.handler({
            roomId: roomId,
            sender: sender,
            message: message,
            type: type,
            parentMessageId: parentMessageId,
          });
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
          console.log("message-sent");
        } catch (error) {
          console.log("Error in sending message", error);
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

    socket.on("answer", async function ({ user, roomId }) {
      // console.log("answer------------->>>>>>", user, roomId);
      try {
        let answer = await answerCtrl.getAnswerByRoom.handler({
          user: user,
          roomId: roomId,
        });
        // console.log("get----->>>", answer.payload);

        io.in(socket.id).emit("answer", answer.payload);
        console.log("answer data sent");
      } catch (error) {
        console.log("Error in finding Chats ", error);
      }
    });

    socket.on(
      "add-answer",
      async function ({ user, question, answer, roomId }) {
        // console.log("add-answer------------->>>>>>", user);
        try {
          let addAnswer = await answerCtrl.newAnswer.handler({
            user: user,
            question: question,
            answer: answer,
            roomId: roomId,
          });
          // console.log("addAnswer Socket---->>", addAnswer.payload.answer);
          io.in(socket.id).emit("add-answer", addAnswer.payload.answer);
          io.emit("check-answer");
          console.log("answer add success.");
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
    socket.on("new-request-chat", async function ({ user, id, roomId }) {
      // console.log("add-answer------------->>>>>>", user);
      try {
        let addNewRequestInChat = await chatCtrl.requestProfile.handler({
          user: user,
          id: id,
          roomId: roomId,
        });
        console.log(
          "New Request in chat Socket---->>",
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
    });

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
    socket.on("accept-request-chat", async function ({ user, requestId }) {
      // console.log("add-answer------------->>>>>>", user);
      try {
        let aacceptRequest = await chatCtrl.acceptRequest.handler({
          user: user,
          requestId: requestId,
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
    });

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
        console.log("chanel name............ reject", channelName);
        console.log("otherId........++++++++++ reject", otherId);
        console.log("token.........+++++++++++ reject", token);
        const res = {
          msg: "call disconnected",
          channelName: String(channelName),
          otherId: String(otherId),
          isForVideoCall: Boolean(isForVideoCall),
          token: token,
        };
        io.in(String(channelName)).emit("onRejectCall", res);
        io.in(String(otherId)).emit("onRejectCall", res);

        console.log("channelNamedisconnect...................", res);
        console.log("otherIddisconnect...................", res);
      }
    );

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("error", function (err) {
      console.log("received error from socket:", socket.id);
      console.log(err);
    });
  });
};

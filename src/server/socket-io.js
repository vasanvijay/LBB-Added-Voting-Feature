"use strict";
const activeUsers = new Set();
const chatCtrl = require("../api/chat");

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
    socket.on("join", async function ({ roomId }) {
      logger.info(`user join room : ${roomId}`);
      socket.userId = roomId;
      activeUsers.add(roomId);

      socket.join(roomId);

      try {
        let chatHistory = await chatCtrl.getMessages.handler(roomId);
        // console.log("history", chatHistory.payload.chats);
        io.in(socket.id).emit("history", { chats: chatHistory.payload.chats });
        console.log("history sent");
      } catch (error) {
        console.log("Error in finding Chats ", error);
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
          console.log("message-sent");
        } catch (error) {
          console.log("Error in sending message", error);
        }
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

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Get All Folder by Search
module.exports = exports = {
  handler: async (req, res) => {
    const { user } = req;
    const { searchData } = req.params;
    if (!searchData) {
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
      let searchUser = await global.models.GLOBAL.USER.find({
        name: { $regex: searchData, $options: "i" },
      });
      let findConection = await global.models.GLOBAL.CONNECTION.find({
        senderId: user._id,
      });
      console.log("connection---->", findConection);

      const sentIdExist = (id) => {
        let check = findConection.filter(function (elc) {
          return elc.receiverId.toString() === id.toString();
        });
        return check.length;
      };

      const pandingIdExist = (id) => {
        let check = findConection.filter(function (elf) {
          return elf.senderId.toString() === id.toString();
        });
        console.log("length---->", check.length);
        return check.length;
      };

      const conectIdExist = (id) => {
        return user.accepted.length
          ? user.accepted.some(function (el) {
              return el.toString() === id.toString();
            })
          : false;
      };
      let allUser = [];
      for (let i = 0; i < searchUser.length; i++) {
        if (conectIdExist(searchUser[i]?._id)) {
          console.log("ID---->>>", searchUser[i]?._id);
          const searchUserObj = {
            searchUser: searchUser[i],
            isFriend: "true",
          };
          allUser.push(searchUserObj);
        } else if (sentIdExist(searchUser[i]?._id)) {
          console.log("ID---->>>", searchUser[i]?._id);
          const connect = findConection.filter((connection) => {
            console.log("connection", typeof connection?.receiverId);
            console.log("user_id", typeof searchUser[i]?._id);
            if (
              connection?.senderId.toString() == searchUser[i]?._id.toString()
            ) {
              return connection;
            }
          });
          const searchUserObj = {
            searchUser: searchUser[i],
            connect: connect,
            isFriend: "sent",
          };
          allUser.push(searchUserObj);
        } else if (pandingIdExist(searchUser[i]?._id)) {
          console.log("ID---->>>", searchUser[i]?._id);
          const searchUserObj = {
            searchUser: searchUser[i],
            isFriend: "pending",
          };
          allUser.push(searchUserObj);
        } else {
          const searchUserObj = {
            searchUser: searchUser[i],
            isFriend: "false",
          };
          allUser.push(searchUserObj);
        }
      }
      if (searchUser.length == 0) {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_FETCHED,
          payload: { allUser },
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
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
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};

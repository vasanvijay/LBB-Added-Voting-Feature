const { nargs } = require("yargs");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Get All Folder by Search
module.exports = exports = {
  handler: async (req, res) => {
    const { user } = req;
    const { searchData } = req.params;
    const { filter } = req.body;
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
      let searchUser = [];
      let distinctUser;
      if (filter) {
        console.log("FILTER---->>>", filter);
        let optionName = [];
        filter.map((fil) => {
          fil?.options?.map((opt) => {
            optionName.push(opt.optionName);
          });
        });
        console.log("OBJ------>>>", optionName);
        for (let i = 0; i < optionName.length; i++) {
          if (optionName[i] != "") {
            let quResult = await global.models.GLOBAL.USER.find({
              name: { $regex: searchData, $options: "i" },
              $and: [{ subject: optionName[i] }],
            });

            for (let j = 0; j < quResult.length; j++) {
              if (quResult[i] != null) {
                searchUser.push(quResult[i]);
              }
            }
          }
        }
        distinctUser = Array.from(new Set(searchUser.map((q) => q._id))).map(
          (id) => {
            return {
              _id: id,
              profileImage: searchUser.find((aid) => aid._id === id)
                .profileImage,
              name: searchUser.find((aid) => aid._id === id).name,
              currentRole: searchUser.find((aid) => aid._id === id).currentRole,
              region: searchUser.find((aid) => aid._id === id).region,
              gender: searchUser.find((aid) => aid._id === id).gender,
            };
          }
        );
      } else {
        let searchUser = await global.models.GLOBAL.USER.find({
          name: { $regex: searchData, $options: "i" },
        });

        distinctUser = Array.from(new Set(searchUser.map((q) => q._id))).map(
          (id) => {
            return {
              _id: id,
              profileImage: searchUser.find((aid) => aid._id === id)
                .profileImage,
              name: searchUser.find((aid) => aid._id === id).name,
              currentRole: searchUser.find((aid) => aid._id === id).currentRole,
              region: searchUser.find((aid) => aid._id === id).region,
              gender: searchUser.find((aid) => aid._id === id).gender,
            };
          }
        );
      }
      let findConection = await global.models.GLOBAL.CONNECTION.find({
        senderId: user._id,
      });

      const sentIdExist = (id) => {
        let check = findConection.filter(function (elc) {
          return elc.receiverId.toString() === id.toString();
        });
        return check.length;
      };

      const pandingIdExist = (id) => {
        let panding = findConection.filter(function (elf) {
          return elf.senderId.toString() === id.toString();
        });
        console.log("length---->", panding.length);
        return panding.length;
      };

      const conectIdExist = (id) => {
        return user.accepted.length
          ? user.accepted.some(function (el) {
              return el.toString() === id.toString();
            })
          : false;
      };
      let allUser = [];
      for (let i = 0; i < distinctUser.length; i++) {
        if (conectIdExist(distinctUser[i]?._id)) {
          console.log("ID---->>>", distinctUser[i]?._id);
          const searchUserObj = {
            searchUser: distinctUser[i],
            isFriend: "true",
          };
          allUser.push(searchUserObj);
        } else if (sentIdExist(distinctUser[i]?._id)) {
          console.log("ID---->>>", distinctUser[i]?._id);
          const searchUserObj = {
            searchUser: distinctUser[i],
            isFriend: "sent",
          };
          allUser.push(searchUserObj);
        } else if (pandingIdExist(distinctUser[i]?._id)) {
          console.log("ID---->>>", distinctUser[i]?._id);
          const searchUserObj = {
            searchUser: distinctUser[i],
            isFriend: "pending",
          };
          allUser.push(searchUserObj);
        } else {
          const searchUserObj = {
            searchUser: distinctUser[i],
            isFriend: "false",
          };
          allUser.push(searchUserObj);
        }
      }
      if (allUser.length == 0) {
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

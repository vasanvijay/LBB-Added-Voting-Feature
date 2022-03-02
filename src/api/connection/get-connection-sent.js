const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { getHeaderFromToken } = require("../../utils");
const utils = require("../../utils");

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async ({ user }) => {
    // const { user } = req;
    // const { sent } = req.query;
    // const { received } = req.query;

    const userData = await getHeaderFromToken(user);

    // console.log("userData-------------------datat", userData);

    try {
      // let findConnection;

      let findUser = await global.models.GLOBAL.USER.findOne({
        _id: userData.id,
      });

      let findConnection = await global.models.GLOBAL.CONNECTION.find({
        senderId: userData.id,
        receiverId: { $nin: findUser.blockUser },
      })

        .populate({
          path: "receiverId",
          model: "user",
          select: "_id name email profileImage region currentRole subject",
        })
        .populate({
          path: "senderId",
          model: "user",
          select: "_id name email profileImage region currentRole subject",
        })
        .sort({
          requestedAt: -1,
        });
      const data4createResponseObject = {
        // req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: { findConnection },
        logPayload: false,
      };
      // console.log("Data---------", data4createResponseObject);
      return data4createResponseObject;

      // res
      //   .status(enums.HTTP_CODES.OK)
      //   .json(utils.createResponseObject(data4createResponseObject));
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

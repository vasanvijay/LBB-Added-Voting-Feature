const { ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { getHeaderFromToken } = require("../../utils");
const utils = require("../../utils");

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    // const useData = await utils.getUserData(user);
    // console.log(user, "useerData");
    const userData = await getHeaderFromToken(user);
    console.log("userDataxxxx", userData);

    try {
      let data = await global.models.GLOBAL.USER.findOne({
        _id: userData.id,
      });
      //   path: "accepted",
      //   model: "user",
      //   select: "_id name email profileImage region currentRole subject",
      // });
      let findConnection = await global.models.GLOBAL.USER.aggregate([
        {
          $match: {
            _id: ObjectId(userData.id),
          },
        },
        {
          $unwind: {
            path: "$accepted",
          },
        },
        {
          $match: {
            accepted: {
              $nin: data.blockUser,
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            data: {
              $push: "$$ROOT",
            },
          },
        },
        {
          $project: {
            data: {
              $slice: ["$data", 1],
            },
          },
        },
        {
          $unwind: {
            path: "$data",
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "data.accepted",
            foreignField: "_id",
            as: "data.accepted",
          },
        },
        {
          $project: {
            _id: "$data._id",
            name: "$data.name",
            email: "$data.email",
            profileImage: "$data.profileImage",
            region: "$data.region",
            currentRole: "$data.currentRole",
            subject: "$data.subject",
            accepted: "$data.accepted",
          },
        },
      ]);
      // findConnection = JSON.parse(JSON.stringify(findConnection));

      console.log("findAcceptedBlockedUser", findConnection);
      const data4createResponseObject = {
        // req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: {
          connection: findConnection[0]?.accepted
            ? findConnection[0].accepted
            : [],
        },
        logPayload: false,
      };

      console.log("qqwwqqwwqqww", findConnection);
      // res
      //   .status(enums.HTTP_CODES.OK)
      //   .json(utils.createResponseObject(data4createResponseObject));
      return data4createResponseObject;
      // return data4createResponseObject;
    } catch (error) {
      // logger.error(
      //   `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
      // );

      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };

      return data4createResponseObject;
      // res
      //   .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
      //   .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};

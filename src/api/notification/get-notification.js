const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { getHeaderFromToken } = require("../../utils");
const utils = require("../../utils");

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  // route handler
  handler: async (req) => {
    const { user, status } = req;

    let notification = [];
    const userData = await getHeaderFromToken(user);
    // console.log("userDa------------------", userData);

    let updateNotification = await global.models.GLOBAL.NOTIFICATION.updateMany(
      { receiverId: userData.id },
      {
        $set: {
          status: false,
        },
      },
      { new: true }
    );
    // console.log("updateNotificationnnn----------", updateNotification);

    try {
      let getNotification = await global.models.GLOBAL.NOTIFICATION.find({
        receiverId: userData.id,
      })
        .sort({ createdAt: -1 })
        .populate({
          path: "userId",
          model: "user",
          select: "_id subject profileImage currentRole",
        });

      // console.log("getNotification", getNotification.length);
      if (getNotification) {
        for (let i = 0; i < getNotification.length; i++) {
          if (getNotification[i].question) {
            let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
              _id: getNotification[i].question,
            });
            let ntfObj;
            let isc = false;
            for (let index = 0; index < user.accepted?.length; index++) {
              if (
                `${user?.accepted[1]}` == `${getNotification[i]?.userId?._id}`
              ) {
                isc = true;
              }
            }

            ntfObj = {
              _id: getNotification[i]._id,
              userId: getNotification[i].userId,
              receiverId: getNotification[i].receiverId,
              title: getNotification[i].title,
              description: getNotification[i].description,
              status: getNotification[i].status,
              createdAt: getNotification[i].createdAt,
              createdBy: getNotification[i].createdBy,
              updatedAt: getNotification[i].updatedAt,
              updatedBy: getNotification[i].updatedBy,
              question: findQuestion,
              isConnected: isc,
            };

            notification.push(ntfObj);
          } else {
            let ntfObj = {
              _id: getNotification[i]._id,
              userId: getNotification[i].userId,
              receiverId: getNotification[i].receiverId,
              title: getNotification[i].title,
              description: getNotification[i].description,
              status: getNotification[i].status,
              createdAt: getNotification[i].createdAt,
              createdBy: getNotification[i].createdBy,
              updatedAt: getNotification[i].updatedAt,
              updatedBy: getNotification[i].updatedBy,
              isConnected: true,
            };
            notification.push(ntfObj);
          }
        }
        // console.log("I-----------------Am", status);

        const data4createResponseObject = {
          // req: req,
          result: 0,
          message: messages.ITEM_FETCHED,
          payload: { notification },
          logPayload: false,
        };
        // return res
        //   .status(enums.HTTP_CODES.OK)
        //   .json(utils.createResponseObject(data4createResponseObject));
        return data4createResponseObject;
      }
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
      // return res
      //   .status(enums.HTTP_CODES.BAD_REQUEST)
      //   .json(utils.createResponseObject(data4createResponseObject));
      return data4createResponseObject;
    }
  },
};

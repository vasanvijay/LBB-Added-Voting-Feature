const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  //Router Handler
  handler: async (req, res) => {
    const { user } = req;
    const { decline } = req.query;
    const { senderId } = req.params;
    if (!senderId) {
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
    if (decline) {
      let findUser = await global.models.GLOBAL.USER.find({
        _id: user._id,
      });
      console.log("Find USer--->", findUser.length);
      if (findUser.length > 0) {
        try {
          const { connectionId } = req.body;
          let declineConnection =
            await global.models.GLOBAL.USER.findOneAndUpdate(
              { _id: senderId },
              {
                $pull: {
                  accepted: user._id,
                },
              },
              { new: true }
            );
          await global.models.GLOBAL.CONNECTION.findByIdAndRemove({
            _id: connectionId,
          });
          declineConnection = JSON.parse(JSON.stringify(declineConnection));

          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
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
          res
            .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      }
    }
  },
};

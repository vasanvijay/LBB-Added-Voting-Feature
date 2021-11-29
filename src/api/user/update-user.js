const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Get User by ID
module.exports = exports = {
  handler: async (req, res) => {
    let { user } = req;
    if (user.userType === enums.USER_TYPE.ADMIN) {
      try {
        let { email, name } = req.body;
        let updateByAdmin = await global.models.GLOBAL.USER.findOneAndUpdate(
          {
            email: email,
          },
          {
            $set: {
              name: name,
              updatedAt: new Date(),
              updatedBy: user.email,
            },
          },
          { new: true }
        );
        if (!updateByAdmin) {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.USER_DOES_NOT_EXIST,
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.NOT_FOUND)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: { updateByAdmin },
            logPayload: false,
          };
          res
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
        res
          .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    } else {
      try {
        if (req?.body?.profileImage?.include("base64")) {
          let findUser = await global.models.GLOBAL.USER.findOne({
            _id: user._id,
          });
          if (findUser.image !== null || undefined) {
            const url = findUser.image.split(".com/").slice(-1)[0];
            console.log(url);
            if (url) {
              utils.mediaDeleteS3(url, function (err) {
                if (err) {
                  console.log("s3 err", err);
                  return next(err);
                }
              });
            }
          }
          req.body.profileImage = await utils.uploadBase(
            req.body.profileImage,
            user._id
          );
        }
        let updateUser = await global.models.GLOBAL.USER.findByIdAndUpdate(
          { _id: user._id },
          {
            $set: {
              ...req.body,
              updatedAt: new Date(),
              updatedBy: user.email,
            },
          },
          { new: true }
        );

        if (!updateUser) {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.USER_DOES_NOT_EXIST,
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.NOT_FOUND)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: { updateUser },
            logPayload: false,
          };
          res
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
        res
          .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    }
  },
};

const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");

const utils = require("../../utils");

// Add About Us by admin
module.exports = exports = {
  // route validation
  validation: Joi.object({
    userId: Joi.string().required(),
    pid: Joi.string().required(),
    paymentId: Joi.string().required(),
    planCost: Joi.number().required(),
    validity: Joi.number().required(),
  }),
  handler: async (req, res) => {
    const { pid, paymentId, planCost, validity, userId } = req.body;

    if (!planCost || !pid || !paymentId || !validity || !userId) {
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

    //find other plan is already added
    const plan = await global.models.GLOBAL.MYPLAN.findOne({
      uid: userId,
    }).sort({ createdAt: -1 });
    let validityDate = new Date();
    let startDate = new Date();
    if (plan) {
      validityDate = new Date(plan.validity);
      startDate = new Date(plan.validity);
      console.log(validityDate, "validityDate");
    }
    validityDate.setDate(validityDate.getDate() + validity);
    console.log(validityDate, "validityDate");

    try {
      let newPlan = {
        uid: userId,
        pid: pid,
        paymentId: paymentId,
        planCost: planCost,
        startDate: startDate,
        validity: validityDate,
      };
      const addNewPlan = await global.models.GLOBAL.MYPLAN(newPlan);
      addNewPlan.save();
      await global.models.GLOBAL.USER.findByIdAndUpdate(userId, {
        $set: {
          paymentVerified: true,
        },
      });
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_INSERTED,
        payload: { addNewPlan },
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    } catch (error) {
      console.log("errorerror", error);
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

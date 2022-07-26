const Joi = require("joi");
const { ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const utils = require("../../utils");

// Update Answer
module.exports = exports = {
  // route validation
  validation: Joi.object({
    answer: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    const answers = await global.models.GLOBAL.ANSWER.find();
    const data4createResponseObject = {
      req: req,
      result: 0,
      message: messages.ITEM_FETCHED,
      payload: { answers },
      logPayload: false,
    };
    return res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
  },
};

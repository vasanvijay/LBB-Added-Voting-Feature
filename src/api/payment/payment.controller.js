const Joi = require("joi");
const mongoose = require("mongoose");
const stripe = require("stripe")(
  "sk_test_51LEVqMSFD9dYcmuf5w87HtOVzgQtI3cxJLOSvTNsNWdRAIASnBXnAj1i93PaND5yqGM6r3CZYUovRy3zpSGL5Dqx00lTOpHDAL"
);
//console.log("stripe", stripe);
// const stripe = require("stripe")(`${process.env.stripe_sk_test}`);
var ObjectID = require("mongodb").ObjectID;
const nodemailer = require("nodemailer");
const enums = require("../../../json/enums.json");
// const utils = require("../../utils");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const utils = require("../../utils");


module.exports = {
  validation: Joi.object({
    pid: Joi.string().required(),
    email: Joi.string().required(),
  }),
  pay: async (req, res, next) => {
    const {
      pid,
      email,
    } = req.body;
    const { user } = req;

    if (!pid || !email) {
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
      let plan = await global.models.GLOBAL.PLAN.findById(pid);
      if(!plan){
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.PLAN_NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.BAD_REQUEST)
          .json(utils.createResponseObject(data4createResponseObject));
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(plan.planCost * 100),
        currency: "usd",
        // Verify your integration in this guide by including this parameter
        metadata: { integration_check: "accept_a_payment" },
        receipt_email: email,
        payment_method_types: ["card"],
        // receipt_menus: menus,
        description: "Payment for a service",
      });

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_INSERTED,
        // payload: { client_secret: plan },
        payload: { client_secret: paymentIntent["client_secret"] },
        logPayload: false,
      };
      return res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
    } catch (error) {
      console.log(error);
      next();
    }
  },
};

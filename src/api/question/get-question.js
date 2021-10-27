const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require('moment')


// Retrieve and return all Category from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { id } = req.query;
    try {
      let question = await global.models.GLOBAL.QUESTION.find().populate({
        path: "createdBy",
        model: "user",
        select: "name",
      });
      // All Question Count

      let count = await global.models.GLOBAL.QUESTION.count(question);


      // today's Questions Count


      let TodayQuestion = await global.models.GLOBAL.QUESTION.find({
        createdAt: {
          $gte: moment(new Date()).format("YYYY-MM-DD"),
        },
      });

      //Questions Profile access

      let QuestionProfileAccess = await global.models.GLOBAL.QUESTION.find({
        displayProfile:true
      });

    // Questions without profile Access
   
    
    let QuestionProfileWithoutAccess = await global.models.GLOBAL.QUESTION.find({
        displayProfile:false
      });


    //   console.log(QuestionProfileWithoutAccess, "TodayQuestion")
    

 

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: { question, count, todaysCount: TodayQuestion.length, profileaccess:QuestionProfileAccess.length, withoutprofileaccess:QuestionProfileWithoutAccess.length },
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
  },
};

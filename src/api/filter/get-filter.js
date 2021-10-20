 const enums = require("../../../json/enums.json");
 const messages = require("../../../json/messages.json");
 
 const logger = require("../../logger");
 const utils = require("../../utils");
 
 // Retrieve and return all Category from the database.
 module.exports = exports = {
 
     // route handler
     handler: async (req, res) => {
         const { type, id } = req.query;
         let criteria = {}
         if (type) {
           let filterType = await global.models.GLOBAL.FILTER_TYPE.findOne(
             { name: type },
             { _id: 1 }
           );
           if (filterType) {
             criteria["filterTypeId"] = filterType._id;
           }
         }
         if (id) {
           criteria["_id"] = id;
         }
         try {
             let filter = await global.models.GLOBAL.FILTER.find(criteria);
             const data4createResponseObject = {
                 req: req,
                 result: 0,
                 message: messages.SUCCESS,
                 payload: { filter },
                 logPayload: false
             };
             res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
         } catch (error) {
             logger.error(`${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`);
             const data4createResponseObject = {
                 req: req,
                 result: -1,
                 message: messages.GENERAL,
                 payload: {},
                 logPayload: false
             };
             res.status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(utils.createResponseObject(data4createResponseObject));
         }
     }
 };
 
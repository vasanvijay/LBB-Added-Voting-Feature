const enums = require("../../json/enums.json");
const messages = require("../../json/messages.json");

module.exports = (app, logger) => {
  // imports all route here

  const userRoute = require("../routes/user/index");
  const filterRoute = require("../routes/filter/index");
  const questionRoute = require("../routes/question/index");
  const contactRoute = require("../routes/contact/index");
  const cmsRoute = require("../routes/cms/index");
  const answerRoute = require("../routes/answer/index");

  // define all routes here
  const { createResponseObject } = require("../utils");

  app.use(["/api/v1/user"], userRoute);
  app.use(["/api/v1/filter"], filterRoute);
  app.use(["/api/v1/question"], questionRoute);
  app.use(["/api/v1/contact"], contactRoute);
  app.use(["/api/v1/cms"], cmsRoute);
  app.use(["/api/v1/answer"], answerRoute);

  /* Catch all */
  app.all("*", function (req, res) {
    res.status(enums.HTTP_CODES.BAD_REQUEST).json(
      createResponseObject({
        req: req,
        result: -1,
        message: "Sorry! The request could not be processed!",
        payload: {},
        logPayload: false,
      })
    );
  });

  // Async error handler
  app.use((error, req, res) => {
    logger.error(
      `${req.originalUrl} - Error caught by error-handler (router.js): ${error.message}\n${error.stack}`
    );
    const data4responseObject = {
      req: req,
      result: -999,
      message: messages.GENERAL,
      payload: {},
      logPayload: false,
    };

    return res
      .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
      .json(createResponseObject(data4responseObject));
  });
};

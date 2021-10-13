const _ = require("lodash");
const accepts = require("accepts");
const crypto = require("crypto");
const flatten = require("flat");
const logger = require("./logger");
const { default: jwtDecode } = require("jwt-decode");

let functions = {};

functions.config4hashes = {
  // size of the generated hash
  hashBytes: 32,
  // larger salt means hashed passwords are more resistant to rainbow table, but
  // you get diminishing returns pretty fast
  saltBytes: 16,
  // more iterations means an attacker has to take longer to brute force an
  // individual password, so larger is better. however, larger also means longer
  // to hash the password. tune so that hashing the password takes about a
  // second
  iterations: 872791,
};

/* create response-wrapper object */
functions.createResponseObject = ({
  req,
  result = 0,
  message = "",
  payload = {},
  logPayload = false,
}) => {
  let payload2log = {};
  if (logPayload) {
    payload2log = flatten({ ...payload });
  }

  let messageToLog = `RES [${req.requestId}] [${req.method}] ${req.originalUrl}`;
  messageToLog +=
    (!_.isEmpty(message) ? `\n${message}` : "") +
    (!_.isEmpty(payload) && logPayload
      ? `\npayload: ${JSON.stringify(payload2log, null, 4)}`
      : "");

  if (result < 0 && (result !== -50 || result !== -51)) {
    logger.error(messageToLog);
  } else if (!_.isEmpty(messageToLog)) {
    logger.info(messageToLog);
  }

  return { result: result, message: message, payload: payload };
};

/* Return true if the app is in production mode */
functions.isLocal = () => process.env.APP_ENVIRONMENT.toLowerCase() === "local";

/* Return true if the app is in production mode */
functions.isProduction = () =>
  process.env.APP_ENVIRONMENT.toLowerCase() === "production" ||
  process.env.APP_ENVIRONMENT.toLowerCase() === "prod";

/* Return true if the app is in production mode */
functions.isTest = () => process.env.APP_ENVIRONMENT.toLowerCase() === "test";

/* Mask a name to initials - e.g., change Bhargav Butani to A. B. */

functions.passwordHash = (password) =>
  crypto.createHash("sha512").update(password.toString()).digest("hex");

/** Sort a JSON by keys */
functions.sortByKeys = (obj) => {
  if (_.isEmpty(obj)) {
    return obj;
  }

  const sortedObj = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sortedObj[key] = obj[key];
    });

  return sortedObj;
};
/* This has to be the last line - add all functions above. */
module.exports = exports = functions;

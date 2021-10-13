const cluster = require("cluster");
const os = require("os");
const { createLogger, format, transports } = require("winston");

const { NODE_ENV = "local" } = process.env;

const getHostAndProcessInfo = () =>
  `[${os.hostname()} ${
    cluster.isWorker ? "WORKER #" + cluster.worker.id : "MASTER"
  }]`;

const logColors = {
  debug: "white",
  data: "grey",
  error: "red",
  help: "cyan",
  info: "green",
  input: "grey",
  prompt: "grey",
  silly: "magenta",
  warn: "cyan",
  verbose: "cyan",
};

const localFormat = format.combine(
  format.colorize({
    colors: logColors,
    message: true,
  }),
  format.timestamp(),
  format.prettyPrint(),
  format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level
      .toUpperCase()
      .trim()} ${getHostAndProcessInfo()} ${message}`;
  })
);

const formatRemote = format.combine(
  format.timestamp(),
  format.prettyPrint(),
  format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level
      .toUpperCase()
      .padEnd(8)} ${getHostAndProcessInfo()} ${message}`;
  })
);

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.simple(),
    format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level
        .toUpperCase()
        .padEnd(8)} ${getHostAndProcessInfo()} ${message}`;
    })
  ),
  transports: [
    new transports.Console({
      format: NODE_ENV === "local" ? localFormat : formatRemote,
      name: "log-console",
      level: "debug",
      handleExceptions: true,
    }),
    // SplunkLogger
  ],
  exceptionHandlers: [
    // SplunkLoggerForExceptions
  ],
  exitOnError: false,
});

module.exports = exports = logger;

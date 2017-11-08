"use strict";

const ENV_LOG_LEVEL = "PRETTIER_LOG_LEVEL";

const chalk = require("chalk");

const warn = createLogger("warn", "yellow");
const error = createLogger("error", "red");
const debug = createLogger("debug", "blue");

function createLogger(loggerName, color) {
  const prefix = `[${chalk[color](loggerName)}] `;
  return function(message) {
    if (shouldLog(loggerName)) {
      console.error(message.replace(/^/gm, prefix).replace(/[\t ]+$/gm, ""));
    }
  };
}

function shouldLog(loggerName) {
  const logLevel = process.env[ENV_LOG_LEVEL];

  switch (logLevel) {
    case "silent":
      return false;
    default:
      return true;
    case "debug":
      if (loggerName === "debug") {
        return true;
      }
    // fall through
    case "warn":
      if (loggerName === "warn") {
        return true;
      }
    // fall through
    case "error":
      return loggerName === "error";
  }
}

module.exports = {
  warn,
  error,
  debug,
  ENV_LOG_LEVEL
};

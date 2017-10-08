"use strict";

const ENV_LOG_LEVEL = "PRETTIER_LOG_LEVEL";

const chalk = require("chalk");

const warn = createLogger("warn", "yellow");
const error = createLogger("error", "red");
const debug = createLogger("debug", "magenta");

function createLogger(loggerName, color) {
  const prefix = `${chalk[color](loggerName)} `;
  return function(message) {
    if (shouldLog(loggerName)) {
      console.error(message.replace(/^/gm, prefix).replace(/[\t ]+$/gm, ""));
    }
  };
}

function shouldLog(loggerName) {
  const logLevel = process.env[ENV_LOG_LEVEL];

  switch (loggerName) {
    case "error":
      if (logLevel === "error") {
        return true;
      }
    // fall through
    case "warn":
      if (logLevel === "warn") {
        return true;
      }
    // fall through
    case "debug":
      if (logLevel === "debug") {
        return true;
      }
    // fall through
    default:
      return logLevel !== "silent";
  }
}

module.exports = {
  warn,
  error,
  debug,
  ENV_LOG_LEVEL
};

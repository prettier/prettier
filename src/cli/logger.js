"use strict";

const ENV_LOG_LEVEL = "PRETTIER_LOG_LEVEL";

const chalk = require("chalk");

const warn = createLogger("warn", "yellow");
const error = createLogger("error", "red");
const debug = createLogger("debug", "blue");
const log = createLogger("log");

function createLogger(loggerName, color) {
  const prefix = color ? `[${chalk[color](loggerName)}] ` : "";
  return function(message, opts) {
    opts = Object.assign({ newline: true }, opts);
    if (shouldLog(loggerName)) {
      const stream = process[loggerName === "log" ? "stdout" : "stderr"];
      stream.write(message.replace(/^/gm, prefix) + (opts.newline ? "\n" : ""));
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
    case "log":
      if (loggerName === "log") {
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
  log,
  ENV_LOG_LEVEL
};

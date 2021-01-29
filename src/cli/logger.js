"use strict";

const chalk = require("chalk");

class Logger {
  constructor(logLevel = "log") {
    this.logLevel = logLevel;
  }

  // @private
  shouldLog(loggerName) {
    switch (this.logLevel) {
      case "silent":
        return false;
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
}

Logger.prototype.warn = createLogFunc("warn", "yellow");
Logger.prototype.error = createLogFunc("error", "red");
Logger.prototype.debug = createLogFunc("debug", "blue");
Logger.prototype.log = createLogFunc("log");

function createLogFunc(loggerName, color) {
  const prefix = color ? `[${chalk[color](loggerName)}] ` : "";
  return function (message, options) {
    if (!this.shouldLog(loggerName)) {
      return;
    }
    const { newline } = { newline: true, ...options };
    const stream = process[loggerName === "log" ? "stdout" : "stderr"];
    stream.write(message.replace(/^/gm, prefix) + (newline ? "\n" : ""));
  };
}

module.exports = Logger;

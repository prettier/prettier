"use strict";

const readline = require("readline");
const wcwidth = require("wcwidth");

// eslint-disable-next-line no-restricted-modules
const { default: stripAnsi } = require("../../vendors/strip-ansi.js");
// eslint-disable-next-line no-restricted-modules
const { default: chalk, chalkStderr } = require("../../vendors/chalk.js");

const countLines = (stream, text) => {
  const columns = stream.columns || 80;
  let lineCount = 0;
  for (const line of stripAnsi(text).split("\n")) {
    lineCount += Math.max(1, Math.ceil(wcwidth(line) / columns));
  }
  return lineCount;
};

const clear = (stream, text) => () => {
  const lineCount = countLines(stream, text);

  for (let line = 0; line < lineCount; line++) {
    if (line > 0) {
      readline.moveCursor(stream, 0, -1);
    }

    readline.clearLine(stream, 0);
    readline.cursorTo(stream, 0);
  }
};

const emptyLogResult = { clear() {} };
function createLogger(logLevel = "log") {
  return {
    logLevel,
    warn: createLogFunc("warn", "yellow"),
    error: createLogFunc("error", "red"),
    debug: createLogFunc("debug", "blue"),
    log: createLogFunc("log"),
  };

  function createLogFunc(loggerName, color) {
    if (!shouldLog(loggerName)) {
      return () => emptyLogResult;
    }

    const stream = process[loggerName === "log" ? "stdout" : "stderr"];
    const chalkInstance = loggerName === "log" ? chalk : chalkStderr;
    const prefix = color ? `[${chalkInstance[color](loggerName)}] ` : "";

    return (message, options) => {
      options = {
        newline: true,
        clearable: false,
        ...options,
      };
      message = message.replace(/^/gm, prefix) + (options.newline ? "\n" : "");
      stream.write(message);

      if (options.clearable) {
        return {
          clear: clear(stream, message),
        };
      }
    };
  }

  function shouldLog(loggerName) {
    switch (logLevel) {
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

module.exports = createLogger;

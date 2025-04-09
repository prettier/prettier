import readline from "node:readline";
import stripAnsi from "strip-ansi";
import wcwidth from "wcwidth.js";
import { picocolors } from "./prettier-internal.js";

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
    /* c8 ignore next 3 */
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
    const prefix = color ? `[${picocolors[color](loggerName)}] ` : "";

    return (message, options) => {
      options = {
        newline: true,
        clearable: false,
        ...options,
      };
      message =
        message.replaceAll(/^/gmu, prefix) + (options.newline ? "\n" : "");
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

export default createLogger;

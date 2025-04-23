import mockable from "./mockable.js";
import { picocolors } from "./prettier-internal.js";

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
          clear: () => mockable.clearStreamText(stream, message),
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

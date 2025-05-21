import mockable from "./mockable.js";
import { picocolors } from "./prettier-internal.js";

const { argv, env } = process;
// https://github.com/alexeyraspopov/picocolors/blob/0e7c4af2de299dd7bc5916f2bddd151fa2f66740/picocolors.js#L2
// Not working on Windows, but this is how `picocolors` works for stdout, let's keep it this way for now
const isStderrColorSupported =
  !(Boolean(env.NO_COLOR) || argv.includes("--no-color")) &&
  (Boolean(env.FORCE_COLOR) ||
    argv.includes("--color") ||
    process.platform === "win32" ||
    (process.stderr.isTTY && env.TERM !== "dumb") ||
    Boolean(env.CI));
// To test this feature,
// run `echo foo | node bin/prettier --unknown-flag --log-level=debug 2>error.log`
// open error.log check if `[warn]` or `[debug]` is colored
// https://github.com/prettier/prettier/issues/13097
const picocolorsStderr = picocolors.createColors(isStderrColorSupported);

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
    const colors = loggerName === "log" ? picocolors : picocolorsStderr;
    const prefix = color ? `[${colors[color](loggerName)}] ` : "";

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

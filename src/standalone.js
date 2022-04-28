import { createRequire } from "node:module";
import core from "./main/core.js";
import { getSupportInfo as getSupportInfoWithoutPlugins } from "./main/support.js";
import languages from "./languages.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

function withPlugins(
  fn,
  optsArgIdx = 1 // Usually `opts` is the 2nd argument
) {
  return (...args) => {
    const opts = args[optsArgIdx] || {};
    const plugins = opts.plugins || [];

    args[optsArgIdx] = {
      ...opts,
      plugins: [
        ...languages,
        ...(Array.isArray(plugins) ? plugins : Object.values(plugins)),
      ],
    };

    return fn(...args);
  };
}

const formatWithCursor = withPlugins(core.formatWithCursor);

function format(text, opts) {
  return formatWithCursor(text, opts).formatted;
}

function check(text, opts) {
  const { formatted } = formatWithCursor(text, opts);
  return formatted === text;
}

const getSupportInfo = withPlugins(getSupportInfoWithoutPlugins, 0);

const debugApis = {
  parse: withPlugins(core.parse),
  formatAST: withPlugins(core.formatAST),
  formatDoc: withPlugins(core.formatDoc),
  printToDoc: withPlugins(core.printToDoc),
  printDocToString: withPlugins(core.printDocToString),
};

export {
  version,
  formatWithCursor,
  format,
  check,
  getSupportInfo,
  debugApis as __debug,
};
export * as util from "./common/util-shared.js";
export {default as doc} from "./document/index.js";

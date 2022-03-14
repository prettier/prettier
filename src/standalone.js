import { createRequire } from "node:module";
import core from "./main/core.js";
import { getSupportInfo } from "./main/support.js";
import * as sharedUtil from "./common/util-shared.js";
import languages from "./languages.js";
import doc from "./document/index.js";

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

const prettierStandalone = {
  formatWithCursor,

  format(text, opts) {
    return formatWithCursor(text, opts).formatted;
  },

  check(text, opts) {
    const { formatted } = formatWithCursor(text, opts);
    return formatted === text;
  },

  doc,

  getSupportInfo: withPlugins(getSupportInfo, 0),

  version,

  util: sharedUtil,

  __debug: {
    parse: withPlugins(core.parse),
    formatAST: withPlugins(core.formatAST),
    formatDoc: withPlugins(core.formatDoc),
    printToDoc: withPlugins(core.printToDoc),
    printDocToString: withPlugins(core.printDocToString),
  },
};

export default prettierStandalone;

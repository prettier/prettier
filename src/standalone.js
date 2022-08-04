import core from "./main/core.js";
import { getSupportInfo as getSupportInfoWithoutPlugins } from "./main/support.js";
import * as languages from "./languages.js";

const builtinPlugins = Object.values(languages);

function withPlugins(
  fn,
  optsArgIdx = 1 // Usually `opts` is the 2nd argument
) {
  // Returns Promises to consistent with functions in `index.js`
  // eslint-disable-next-line require-await
  return async (...args) => {
    const opts = args[optsArgIdx] || {};
    const plugins = opts.plugins || [];

    args[optsArgIdx] = {
      ...opts,
      plugins: [
        ...builtinPlugins,
        ...(Array.isArray(plugins) ? plugins : Object.values(plugins)),
      ],
    };

    return fn(...args);
  };
}

const formatWithCursor = withPlugins(core.formatWithCursor);

async function format(text, options) {
  const { formatted } = await formatWithCursor(text, {
    ...options,
    cursorOffset: -1,
  });
  return formatted;
}

async function check(text, options) {
  return (await format(text, options)) === text;
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
  formatWithCursor,
  format,
  check,
  getSupportInfo,
  debugApis as __debug,
};
export * as util from "./common/util-shared.js";
export * as doc from "./document/index.js";
export { default as version } from "./main/version.evaluate.js";

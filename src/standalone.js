import * as core from "./main/core.js";
import { getSupportInfo as getSupportInfoWithoutPlugins } from "./main/support.js";

function withPlugins(
  fn,
  optionsArgumentIndex = 1, // Usually `options` is the 2nd argument
) {
  // Returns Promises to consistent with functions in `index.js`
  // eslint-disable-next-line require-await
  return async (...args) => {
    const options = args[optionsArgumentIndex] ?? {};
    const plugins = options.plugins ?? [];

    args[optionsArgumentIndex] = {
      ...options,
      plugins: Array.isArray(plugins) ? plugins : Object.values(plugins),
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
  formatAST: withPlugins(core.formatAst),
  formatDoc: withPlugins(core.formatDoc),
  printToDoc: withPlugins(core.printToDoc),
  printDocToString: withPlugins(core.printDocToString),
};

export {
  debugApis as __debug,
  check,
  format,
  formatWithCursor,
  getSupportInfo,
};
export * as doc from "./document/public.js";
export { default as version } from "./main/version.evaluate.js";
export * as util from "./utils/public.js";

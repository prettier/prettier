import vnopts from "vnopts";
import fastGlob from "fast-glob";
import * as core from "./main/core.js";
import { getSupportInfo as getSupportInfoWithoutPlugins } from "./main/support.js";
import getFileInfoWithoutPlugins from "./common/get-file-info.js";
import {
  loadPlugins,
  clearCache as clearPluginCache,
} from "./common/load-plugins.js";
import {
  resolveConfig,
  resolveConfigFile,
  clearCache as clearConfigCache,
} from "./config/resolve-config.js";
import * as errors from "./common/errors.js";
import * as coreOptions from "./main/core-options.evaluate.js";
import { createIsIgnoredFunction } from "./utils/ignore.js";
import { formatOptionsHiddenDefaults } from "./main/normalize-format-options.js";
import normalizeOptions from "./main/normalize-options.js";
import arrayify from "./utils/arrayify.js";
import partition from "./utils/partition.js";
import isNonEmptyArray from "./utils/is-non-empty-array.js";

let builtinPlugins;

/**
 * @param {*} fn
 * @param {*} optsArgIdx
 * @returns {*}
 */
function withPlugins(
  fn,
  optsArgIdx = 1 // Usually `opts` is the 2nd argument
) {
  return async (...args) => {
    const opts = args[optsArgIdx] || {};
    builtinPlugins ??= await Promise.all([
      import("./plugins/estree.js"),
      import("./plugins/babel.js"),
      import("./plugins/flow.js"),
      import("./plugins/typescript.js"),
      import("./plugins/acorn.js"),
      import("./plugins/meriyah.js"),
      import("./plugins/angular.js"),
      import("./plugins/postcss.js"),
      import("./plugins/graphql.js"),
      import("./plugins/markdown.js"),
      import("./plugins/glimmer.js"),
      import("./plugins/html.js"),
      import("./plugins/yaml.js"),
    ]);

    args[optsArgIdx] = {
      ...opts,
      plugins: [
        ...builtinPlugins,
        ...(await loadPlugins(opts.plugins, opts.pluginSearchDirs)),
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

// eslint-disable-next-line require-await
async function clearCache() {
  clearConfigCache();
  clearPluginCache();
}

/** @type {typeof getFileInfoWithoutPlugins} */
const getFileInfo = withPlugins(getFileInfoWithoutPlugins);

/** @type {typeof getSupportInfoWithoutPlugins} */
const getSupportInfo = withPlugins(getSupportInfoWithoutPlugins, 0);

// Internal shared with cli
const sharedWithCli = {
  errors,
  coreOptions,
  createIsIgnoredFunction,
  formatOptionsHiddenDefaults,
  normalizeOptions,
  getSupportInfoWithoutPlugins,
  vnopts,
  fastGlob,
  utils: {
    arrayify,
    isNonEmptyArray,
    partition,
  },
};

const debugApis = {
  parse: withPlugins(core.parse),
  formatAST: withPlugins(core.formatAst),
  formatDoc: withPlugins(core.formatDoc),
  printToDoc: withPlugins(core.printToDoc),
  printDocToString: withPlugins(core.printDocToString),
};

export {
  formatWithCursor,
  format,
  check,
  resolveConfig,
  resolveConfigFile,
  clearCache as clearConfigCache,
  getFileInfo,
  getSupportInfo,
  sharedWithCli as __internal,
  debugApis as __debug,
};
export * as util from "./utils/public.js";
export * as doc from "./document/public.js";
export { default as version } from "./main/version.evaluate.cjs";

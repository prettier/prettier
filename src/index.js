import * as vnopts from "vnopts";
// "fast-glob" is bundled here since the API uses `micromatch` too
import fastGlob from "fast-glob";
import * as core from "./main/core.js";
import {
  getSupportInfo as getSupportInfoWithoutPlugins,
  normalizeOptionSettings,
} from "./main/support.js";
import inferParserWithoutPlugins from "./utils/infer-parser.js";
import getFileInfoWithoutPlugins from "./common/get-file-info.js";
import {
  loadBuiltinPlugins,
  loadPlugins,
  clearCache as clearPluginCache,
} from "./main/plugins/index.js";
import {
  resolveConfig,
  resolveConfigFile,
  clearCache as clearConfigCache,
} from "./config/resolve-config.js";
import * as errors from "./common/errors.js";
import * as optionCategories from "./main/option-categories.js";
import { createIsIgnoredFunction } from "./utils/ignore.js";
import { formatOptionsHiddenDefaults } from "./main/normalize-format-options.js";
import normalizeOptions from "./main/normalize-options.js";
import partition from "./utils/partition.js";
import isNonEmptyArray from "./utils/is-non-empty-array.js";
import omit from "./utils/object-omit.js";
import mockable from "./common/mockable.js";

/**
 * @param {*} fn
 * @param {number} [optionsArgumentIndex]
 * @returns {*}
 */
function withPlugins(
  fn,
  optionsArgumentIndex = 1, // Usually `options` is the 2nd argument
) {
  return async (...args) => {
    const options = args[optionsArgumentIndex] ?? {};
    const { plugins = [] } = options;

    args[optionsArgumentIndex] = {
      ...options,
      plugins: (
        await Promise.all([
          loadBuiltinPlugins(),
          // TODO: standalone version allow `plugins` to be `prettierPlugins` which is an object, should allow that too
          loadPlugins(plugins),
        ])
      ).flat(),
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

const inferParser = withPlugins((file, options) =>
  inferParserWithoutPlugins(options, { physicalFile: file }),
);

// Internal shared with cli
const sharedWithCli = {
  errors,
  optionCategories,
  createIsIgnoredFunction,
  formatOptionsHiddenDefaults,
  normalizeOptions,
  getSupportInfoWithoutPlugins,
  normalizeOptionSettings,
  inferParser: (file, options) =>
    Promise.resolve(options?.parser ?? inferParser(file, options)),
  vnopts: {
    ChoiceSchema: vnopts.ChoiceSchema,
    apiDescriptor: vnopts.apiDescriptor,
  },
  fastGlob,
  utils: {
    isNonEmptyArray,
    partition,
    omit,
  },
  mockable,
};

const debugApis = {
  parse: withPlugins(core.parse),
  formatAST: withPlugins(core.formatAst),
  formatDoc: withPlugins(core.formatDoc),
  printToDoc: withPlugins(core.printToDoc),
  printDocToString: withPlugins(core.printDocToString),
  mockable,
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

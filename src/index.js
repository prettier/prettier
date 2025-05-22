/*
The following are bundled here since they are used in API too
- fast-glob
- createTwoFilesPatch
- leven
- picocolors
*/
import { createTwoFilesPatch } from "diff/lib/patch/create.js";
import fastGlob from "fast-glob";
import leven from "leven";
import picocolors from "picocolors";
import * as vnopts from "vnopts";
import * as errors from "./common/errors.js";
import getFileInfoWithoutPlugins from "./common/get-file-info.js";
import { mockable } from "./common/mockable.js";
import {
  clearCache as clearConfigCache,
  resolveConfig,
  resolveConfigFile,
} from "./config/resolve-config.js";
import * as core from "./main/core.js";
import { formatOptionsHiddenDefaults } from "./main/normalize-format-options.js";
import normalizeOptions from "./main/normalize-options.js";
import * as optionCategories from "./main/option-categories.js";
import {
  clearCache as clearPluginCache,
  loadBuiltinPlugins,
  loadPlugins,
} from "./main/plugins/index.js";
import {
  getSupportInfo as getSupportInfoWithoutPlugins,
  normalizeOptionSettings,
} from "./main/support.js";
import createMockable from "./utils/create-mockable.js";
import { createIsIgnoredFunction } from "./utils/ignore.js";
import inferParserWithoutPlugins from "./utils/infer-parser.js";
import omit from "./utils/object-omit.js";

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
  createTwoFilesPatch,
  picocolors,
  leven,
  utils: {
    omit,
    createMockable,
  },
};

const debugApis = {
  parse: withPlugins(core.parse),
  formatAST: withPlugins(core.formatAst),
  formatDoc: withPlugins(core.formatDoc),
  printToDoc: withPlugins(core.printToDoc),
  printDocToString: withPlugins(core.printDocToString),
  // Exposed for tests
  mockable,
};

export {
  debugApis as __debug,
  sharedWithCli as __internal,
  check,
  clearCache as clearConfigCache,
  format,
  formatWithCursor,
  getFileInfo,
  getSupportInfo,
  resolveConfig,
  resolveConfigFile,
};
export * as doc from "./document/public.js";
export { default as version } from "./main/version.evaluate.js";
export * as util from "./utils/public.js";

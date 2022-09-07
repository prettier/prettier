"use strict";

const path = require("path");
const ignore = require("ignore").default;

const getFileContentOrNull = require("../utils/get-file-content-or-null.js");
const thirdParty = require("../common/third-party.js");

/**
 * @param {string} filePath
 * @param {string?} ignorePath
 * @param {boolean?} withNodeModules
 */
async function createIgnorer(filePath, ignorePath, withNodeModules) {
  // prettier-ignore
  const ignoreContent = ignorePath &&
    await getFileContentOrNull(path.resolve(ignorePath)) ||
    await _createExplorer(false).search(path.resolve(filePath));

  return _createIgnorer(ignoreContent, withNodeModules);
}

/**
 * @param {string} filePath
 * @param {string?} ignorePath
 * @param {boolean?} withNodeModules
 */
createIgnorer.sync = function (filePath, ignorePath, withNodeModules) {
  // prettier-ignore
  const ignoreContent = ignorePath &&
    getFileContentOrNull.sync(path.resolve(ignorePath)) ||
    _createExplorer(true).search(path.resolve(filePath));

  return _createIgnorer(ignoreContent, withNodeModules);
};

/**
 * @param {boolean} sync
 */
function _createExplorer(sync) {
  const cosmiconfig = thirdParty["cosmiconfig" + (sync ? "Sync" : "")];

  const explorer = cosmiconfig("prettierignore", {
    packageProp: "prettierIgnore",
    searchPlaces: ["package.json"],
    transform: (result) => {
      if (result && result.config) {
        if (
          Array.isArray(result.config) &&
          result.config.every((entry) => typeof entry === "string")
        ) {
          // Return `config` directly so that we don't have to await before this
          return result.config;
        }

        throw new TypeError(
          "File list is only allowed to be an array of strings, " +
            `but received ${typeof result.config} in "${result.filepath}"`
        );
      }

      return result;
    },
  });

  return explorer;
}

/**
 * @param {null | string | readonly string[]} ignoreContent
 * @param {boolean?} withNodeModules
 */
function _createIgnorer(ignoreContent, withNodeModules) {
  const ignorer = ignore({ allowRelativePaths: true }).add(ignoreContent || "");
  if (!withNodeModules) {
    ignorer.add("node_modules");
  }

  return ignorer;
}

module.exports = createIgnorer;

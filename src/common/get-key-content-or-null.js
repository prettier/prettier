"use strict";

const path = require("path");
const getFileContentOrNull = require("../utils/get-file-content-or-null.js");
const { findParentDir } = require("./third-party.js");

/**
 * @param {string?} filePath
 * @param {string?} key
 * @param {string=} filename
 * @returns {Promise<null | string | readonly string[]>}
 */
async function getKeyContentOrNull(filePath, key, filename = "package.json") {
  if (!filePath || !key) {
    return null;
  }

  const cache = [];

  do {
    try {
      const file = await getFileContentOrNull(path.resolve(filePath, filename));
      const content = JSON.parse(file)?.[key];

      if (content) {
        return content;
      }
    } catch {
      // Malformed or null-ish file - continue searching...
    }

    cache.push(filePath);
    filePath = findParentDir(filePath, filename);
  } while (filePath && !cache.includes(filePath));

  return null;
}

/**
 * @param {string?} filePath
 * @param {string?} key
 * @param {string=} filename
 * @returns {null | string | readonly string[]}
 */
getKeyContentOrNull.sync = function (filePath, key, filename = "package.json") {
  if (!filePath || !key) {
    return null;
  }

  const cache = [];

  do {
    const file = getFileContentOrNull.sync(path.resolve(filePath, filename));

    try {
      const content = JSON.parse(file)?.[key];

      if (content) {
        return content;
      }
    } catch {
      // Malformed or null-ish file - continue searching...
    }

    cache.push(filePath);
    filePath = findParentDir(filePath, filename);
  } while (filePath && !cache.includes(filePath));

  return null;
};

module.exports = getKeyContentOrNull;

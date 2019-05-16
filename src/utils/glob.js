"use strict";

const path = require("path");
const isDirectory = require("./is-dir");

module.exports = function glob(patterns, languages) {
  const cwd = process.cwd();
  let extensions = [];
  let filenames = [];

  for (const language of languages) {
    if (language.extensions) {
      extensions = extensions.concat(
        language.extensions.map(ext => ext.substr(1))
      );
    }

    if (language.filenames) {
      filenames = filenames.concat(language.filenames);
    }
  }

  extensions =
    extensions.length > 1 ? `{${extensions.join(",")}}` : extensions[0];
  filenames = filenames.length > 1 ? `{${filenames.join(",")}}` : filenames[0];

  const result = [];
  for (const pattern of patterns) {
    const abspath = path.isAbsolute(pattern)
      ? pattern
      : path.join(cwd, pattern);

    if (isDirectory(abspath)) {
      result.push(
        path.join(pattern, `**/*.${extensions}`),
        path.join(pattern, `**/${filenames}`)
      );
    } else {
      result.push(pattern);
    }
  }

  return result;
};

"use strict";

const path = require('path');
const getSupportInfo = require("../common/support").getSupportInfo;

function inferParser(filepath, plugins) {
  const extension = path.extname(filepath);
  const filename = path.basename(filepath).toLowerCase();

  const language = getSupportInfo(null, {
    plugins,
    pluginsLoaded: true
  }).languages.find(
    language =>
      language.since !== null &&
      (language.extensions.indexOf(extension) > -1 ||
        (language.filenames &&
          language.filenames.find(name => name.toLowerCase() === filename)))
  );

  return language && language.parsers[0];
}

module.exports = inferParser;

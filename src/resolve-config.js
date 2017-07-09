"use strict";

const cosmiconfig = require("cosmiconfig");
const path = require("path");

const withCache = cosmiconfig("prettier");
const noCache = cosmiconfig("prettier", { cache: false });

function resolveConfig(filePath, opts) {
  const useCache = !(opts && opts.useCache === false);

  return (
    (useCache ? withCache : noCache)
      // https://github.com/davidtheclark/cosmiconfig/pull/68
      .load(filePath, opts && opts.configFile)
      .then(result => {
        if (!result) {
          return {};
        }

        const options = Object.keys(result.config || {}).reduce((opts, key) => {
          if (key.charAt(0) !== ".") {
            opts[key] = result.config[key];
          }
          return opts;
        }, {});

        if (filePath) {
          const extname = path.extname(filePath);
          Object.assign(options, result.config[extname]);
        }

        return options;
      })
  );
}

function resolveConfigFile(filePath) {
  return noCache.load(filePath).then(result => {
    if (result) {
      return result.filepath;
    }
    return null;
  });
}

module.exports = {
  resolveConfig,
  resolveConfigFile
};

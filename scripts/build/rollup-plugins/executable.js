"use strict";

const fs = require("fs");
const path = require("path");

module.exports = function() {
  let banner;
  let entry;

  return {
    name: "executable",

    options(options) {
      entry = path.resolve(options.input);
      return options;
    },

    load(id) {
      if (id !== entry) {
        return;
      }
      const source = fs.readFileSync(id, "utf-8");
      const match = source.match(/^\s*(#!.*)/);
      if (match) {
        banner = match[1];
        return (
          source.slice(0, match.index) +
          source.slice(match.index + banner.length)
        );
      }
    },

    renderChunk(code) {
      if (banner) {
        return { code: banner + "\n" + code };
      }
    },

    writeBundle(bundle) {
      if (banner) {
        const files = Object.keys(bundle);
        files.forEach(file => {
          fs.chmodSync(bundle[file].facadeModuleId, 0o755 & ~process.umask());
        });
      }
    }
  };
};

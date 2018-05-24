"use strict";

const fs = require("fs");
const path = require("path");

module.exports = function() {
  let banner;
  let entry;

  return {
    options(options) {
      entry = path.resolve(options.entry);
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

    transformBundle(code) {
      if (banner) {
        return { code: banner + "\n" + code };
      }
    },

    onwrite(bundle) {
      if (banner) {
        fs.chmodSync(bundle.dest, 0o755 & ~process.umask());
      }
    }
  };
};

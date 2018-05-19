"use strict";

const fs = require("fs");

module.exports = function() {
  let banner;

  return {
    transform(code) {
      const match = /^\s*(#!.*)/.exec(code);
      if (match) {
        banner = match[1];
        code =
          code.slice(0, match.index) + code.slice(match.index + banner.length);
        return { code };
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

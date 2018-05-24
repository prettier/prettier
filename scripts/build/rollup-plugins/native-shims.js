"use strict";

const builtins = require("builtin-modules");
const fs = require("fs");
const path = require("path");
const tempy = require("tempy");

module.exports = function(dir) {
  return {
    resolveId(importee, importer) {
      if (!importee || !importer || /\0/.test(importee)) {
        return null;
      }

      if (!~builtins.indexOf(importee)) {
        return null;
      }

      const newPath = path.resolve(dir, `${importee}.js`);
      if (fs.existsSync(newPath)) {
        return newPath;
      }

      // This helps debugging when a stub in the module is needed
      const fallback = tempy.file({ name: `${importee}.js` });
      fs.writeFileSync(fallback, "module.exports = {};");
      return fallback;
    }
  };
};

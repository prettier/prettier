"use strict";

module.exports = function(modules = {}) {
  return {
    name: "internal-replace",

    load(importee) {
      if (modules[importee]) {
        return `export default eval('require')('${modules[importee]}').default`;
      }

      return null;
    }
  };
};

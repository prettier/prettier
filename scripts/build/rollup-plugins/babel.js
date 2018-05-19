"use strict";

const babel = require("@babel/core");

module.exports = function(options) {
  return {
    transform(code) {
      return {
        code: babel.transformSync(
          code,
          Object.assign({ babelrc: false }, options)
        ).code
      };
    }
  };
};

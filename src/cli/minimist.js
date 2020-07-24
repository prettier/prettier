"use strict";

const minimist = require("minimist");
const fromPairs = require("lodash/fromPairs");

const PLACEHOLDER = null;

/**
 * unspecified boolean flag without default value is parsed as `undefined` instead of `false`
 */
module.exports = function (args, options) {
  const boolean = options.boolean || [];
  const defaults = options.default || {};

  const booleanWithoutDefault = boolean.filter((key) => !(key in defaults));
  const newDefaults = {
    ...defaults,
    ...fromPairs(booleanWithoutDefault.map((key) => [key, PLACEHOLDER])),
  };

  const parsed = minimist(args, {
    ...options,
    default: newDefaults,
    unknown(option) {
      if (/-{1,2}/.test(option)) {
        console.log(`Invalid option "${option}".`);
        process.exit(1);
      }
    },
  });

  return fromPairs(
    Object.entries(parsed).filter(([, value]) => value !== PLACEHOLDER)
  );
};

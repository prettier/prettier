"use strict";

const minimist = require("minimist");

const PLACEHOLDER = null;

/**
 * unspecified boolean flag without default value is parsed as `undefined` instead of `false`
 */
module.exports = function(args, options) {
  const boolean = options.boolean || [];
  const defaults = options.default || {};

  const booleanWithoutDefault = boolean.filter(key => !(key in defaults));
  const newDefaults = Object.assign(
    {},
    defaults,
    booleanWithoutDefault.reduce(
      (reduced, key) => Object.assign(reduced, { [key]: PLACEHOLDER }),
      {}
    )
  );

  const parsed = minimist(
    args,
    Object.assign({}, options, { default: newDefaults })
  );

  return Object.keys(parsed).reduce((reduced, key) => {
    if (parsed[key] !== PLACEHOLDER) {
      reduced[key] = parsed[key];
    }
    return reduced;
  }, {});
};

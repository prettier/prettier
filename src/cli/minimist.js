"use strict";

const minimist = require("minimist");

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
    ...Object.fromEntries(
      booleanWithoutDefault.map((key) => [key, PLACEHOLDER])
    ),
  };

  const parsed = minimist(args, { ...options, default: newDefaults });

  return Object.fromEntries(
    Object.entries(parsed).filter(([, value]) => value !== PLACEHOLDER)
  );
};

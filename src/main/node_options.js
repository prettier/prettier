"use strict";

const { normalize: baseNormalize, hiddenDefaults } = require("./options");
const loadPlugins = require("../common/load-plugins");

function normalize(options, opts) {
  options = options || {};
  return baseNormalize(
    Object.assign({}, options, {
      plugins: loadPlugins(options.plugins)
    }),
    opts
  );
}

module.exports = { normalize, hiddenDefaults };

"use strict";

function loadPlugins(/* options.plugins */) {
  const internalPlugins = [
    require("../language-js"),
    require("../language-css"),
    require("../language-graphql"),
    require("../language-markdown"),
    require("../language-html")
  ];

  return internalPlugins;
}

module.exports = loadPlugins;

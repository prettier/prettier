/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: {
    About: [
      "index",
      "why-prettier",
      "comparison",
      "option-philosophy",
      "rationale",
    ],
    Usage: [
      "install",
      "ignore",
      "integrating-with-linters",
      "precommit",
      "plugins",
      "cli",
      "api",
      "browser",
    ],
    "Configuring Prettier": ["options", "configuration"],
    Editors: ["editors", "webstorm", "vim", "watching-files"],
    Misc: ["technical-details", "related-projects", "for-enterprise"],
  },
};

// eslint-disable-next-line unicorn/prefer-module
module.exports = sidebars;

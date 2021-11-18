"use strict";

// We need to list the parsers and getters so we can load them only when necessary.
module.exports = [
  // JS
  require("./language-js/index.js"),
  // CSS
  require("./language-css/index.js"),
  // Handlebars
  require("./language-handlebars/index.js"),
  // GraphQL
  require("./language-graphql/index.js"),
  // Markdown
  require("./language-markdown/index.js"),
  // HTML
  require("./language-html/index.js"),
  // YAML
  require("./language-yaml/index.js"),
];

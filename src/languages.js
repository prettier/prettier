"use strict";

// We need to list the parsers and getters so we can load them only when necessary.
module.exports = [
  // JS
  require("./language-js.js"),
  // CSS
  require("./language-css.js"),
  // Handlebars
  require("./language-handlebars.js"),
  // GraphQL
  require("./language-graphql.js"),
  // Markdown
  require("./language-markdown.js"),
  // HTML
  require("./language-html.js"),
  // YAML
  require("./language-yaml.js"),
];

import * as js from "./language-js/index.js";
import * as css from "./language-css/index.js";
import * as handlebars from "./language-handlebars/index.js";
import * as graphql from "./language-graphql/index.js";
import * as markdown from "./language-markdown/index.js";
import * as html from "./language-html/index.js";
import * as yaml from "./language-yaml/index.js";

// We need to list the parsers and getters so we can load them only when necessary.
const languages = [
  // JS
  js,
  // CSS
  css,
  // Handlebars
  handlebars,
  // GraphQL
  graphql,
  // Markdown
  markdown,
  // HTML
  html,
  // YAML
  yaml,
];

export default languages;

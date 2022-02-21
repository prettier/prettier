import js from "./language-js/index.js";
import css from "./language-css/index.js";
import handlebars from "./language-handlebars/index.js";
import graphql from "./language-graphql/index.js";
import markdown from "./language-markdown/index.js";
import html from "./language-html/index.js";
import yaml from "./language-yaml/index.js";

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

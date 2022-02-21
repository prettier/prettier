import { createRequire } from "module";
import css from "./language-css/index.js";
import handlebars from "./language-handlebars/index.js";
import graphql from "./language-graphql/index.js";
import markdown from "./language-markdown/index.js";
import yaml from "./language-yaml/index.js";

const require = createRequire(import.meta.url);

// We need to list the parsers and getters so we can load them only when necessary.
const languages = [
  // JS
  require("./language-js/index.js"),
  // CSS
  css,
  // Handlebars
  handlebars,
  // GraphQL
  graphql,
  // Markdown
  markdown,
  // HTML
  require("./language-html/index.js"),
  // YAML
  yaml,
];

export default languages;

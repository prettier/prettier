import { createRequire } from "module";
import js from "./language-js/index.js";
import graphql from "./language-graphql/index.js";
import markdown from "./language-markdown/index.js";
import yaml from "./language-yaml/index.js";

const require = createRequire(import.meta.url);

// We need to list the parsers and getters so we can load them only when necessary.
const languages = [
  // JS
  js,
  // CSS
  require("./language-css/index.js"),
  // Handlebars
  require("./language-handlebars/index.js"),
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

import { createRequire } from "module";

import markdown from "./language-markdown/index.js";

const require = createRequire(import.meta.url);

// We need to list the parsers and getters so we can load them only when necessary.
const languages = [
  // JS
  require("./language-js/index.js"),
  // CSS
  require("./language-css/index.js"),
  // Handlebars
  require("./language-handlebars/index.js"),
  // GraphQL
  require("./language-graphql/index.js"),
  // Markdown
  markdown,
  // HTML
  require("./language-html/index.js"),
  // YAML
  require("./language-yaml/index.js"),
];

export default languages;

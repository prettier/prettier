"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const files = [
  "standalone.js",
  "parser-babylon.js",
  "parser-flow.js",
  "parser-typescript.js",
  "parser-postcss.js",
  "parser-graphql.js",
  "parser-markdown.js",
  "parser-vue.js"
];
const base = files
  .map(filename =>
    fs.readFileSync(path.join(process.env.PRETTIER_DIR, filename), "utf-8")
  )
  .join("\n");

const formatScript = new vm.Script(
  base +
    `$$$g.output = (function(input, options) {
        options = Object.assign({ plugins: prettierPlugins }, options);
        return prettier.formatWithCursor(input, options);
      })($$$g.input, $$$g.options);`
);

const parseScript = new vm.Script(
  base +
    `$$$g.parsed = (function(input, options, massage) {
        options = Object.assign({ plugins: prettierPlugins }, options);
        return prettier.__debug.parse(input, options, massage);
      })($$$g.input, $$$g.options,  $$$g.massage);`
);

module.exports = {
  formatWithCursor(input, options) {
    const g = { input, options };
    formatScript.runInNewContext({ $$$g: g });
    return g.output;
  },
  __debug: {
    parse(input, options, massage) {
      const g = { input, options, massage };
      parseScript.runInNewContext({ $$$g: g });
      return g.parsed;
    }
  }
};

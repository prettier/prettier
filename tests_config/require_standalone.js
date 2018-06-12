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

const sandbox = vm.createContext();
vm.runInContext(base, sandbox);

module.exports = {
  formatWithCursor(input, options) {
    vm.runInContext(
      `output = prettier.formatWithCursor(
        ${JSON.stringify(input)},
        Object.assign({ plugins: prettierPlugins }, ${JSON.stringify(options)})
      );`,
      sandbox
    );
    return sandbox.output;
  },

  __debug: {
    parse(input, options, massage) {
      vm.runInContext(
        `output = prettier.__debug.parse(
          ${JSON.stringify(input)},
          Object.assign({ plugins: prettierPlugins }, ${JSON.stringify(
            options
          )}),
          ${JSON.stringify(massage)}
        );`,
        sandbox
      );
      return sandbox.output;
    }
  }
};

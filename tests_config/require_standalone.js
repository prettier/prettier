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

function makeContext(base, input, options) {
  return vm.createContext(
    Object.assign(
      { $$$input: input, $$$options: options },
      base
    )
  );
}

module.exports = {
  formatWithCursor(input, options) {
    return vm.runInContext(
      `prettier.formatWithCursor(
        $$$input,
        Object.assign({ plugins: prettierPlugins }, $$$options)
      );`,
      makeContext(sandbox, input, options)
    );
  },

  __debug: {
    parse(input, options, massage) {
      return vm.runInContext(
        `prettier.__debug.parse(
          $$$input,
          Object.assign({ plugins: prettierPlugins }, $$$options),
          ${JSON.stringify(massage)}
        );`,
        makeContext(sandbox, input, options)
      );
    }
  }
};

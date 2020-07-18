"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const sources = [
  "standalone.js",
  "parser-angular.js",
  "parser-babel.js",
  "parser-flow.js",
  "parser-glimmer.js",
  "parser-graphql.js",
  "parser-html.js",
  "parser-markdown.js",
  "parser-postcss.js",
  "parser-typescript.js",
  "parser-yaml.js",
].map((filename) =>
  fs.readFileSync(path.join(process.env.PRETTIER_DIR, filename), "utf-8")
);

const sandbox = vm.createContext();
vm.runInContext(sources.join(";"), sandbox);

// TODO: maybe expose (and write tests) for `format`, `utils`, and
// `__debug` methods
module.exports = {
  formatWithCursor(input, options) {
    return vm.runInNewContext(
      `
        const options = {
          ...$$$options,
          plugins: [
            ...Object.values(prettierPlugins),
            ...($$$options.plugins || []),
          ],
        };
        prettier.formatWithCursor($$$input, options);
      `,
      { $$$input: input, $$$options: options, ...sandbox }
    );
  },

  __debug: {
    parse(input, options, massage) {
      return vm.runInNewContext(
        `
          const options = {
            ...$$$options,
            plugins: [
              ...Object.values(prettierPlugins),
              ...($$$options.plugins || []),
            ],
          };
          prettier.__debug.parse($$$input, options, ${JSON.stringify(massage)});
        `,
        { $$$input: input, $$$options: options, ...sandbox }
      );
    },
  },
};

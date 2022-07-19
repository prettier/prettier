"use strict";
const vm = require("vm");
const fastGlob = require("fast-glob");
const createSandBox = require("./utils/create-sandbox.js");

const sandbox = createSandBox({
  files: fastGlob.sync(["standalone.js", "parser-*.js"], {
    cwd: process.env.PRETTIER_DIR,
    absolute: true,
  }),
});

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

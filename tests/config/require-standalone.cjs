"use strict";
const vm = require("vm");
const fastGlob = require("fast-glob");
const createSandBox = require("./utils/create-sandbox.cjs");

const sandbox = createSandBox({
  files: fastGlob.sync(["standalone.js", "plugins/*.js"], {
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
      { $$$input: input, $$$options: options, ...sandbox },
    );
  },

  getSupportInfo(options = {}) {
    return vm.runInNewContext(
      `
        const options = {
          ...$$$options,
          plugins: [
            ...Object.values(prettierPlugins),
            ...($$$options.plugins || []),
          ],
        };
        prettier.getSupportInfo(options);
      `,
      { $$$options: options, ...sandbox },
    );
  },

  __debug: {
    parse(input, options, devOptions) {
      return vm.runInNewContext(
        `
          const options = {
            ...$$$options,
            plugins: [
              ...Object.values(prettierPlugins),
              ...($$$options.plugins || []),
            ],
          };
          prettier.__debug.parse($$$input, options, $$$devOptions);
        `,
        {
          $$$input: input,
          $$$options: options,
          $$$devOptions: devOptions,
          ...sandbox,
        },
      );
    },
  },
};

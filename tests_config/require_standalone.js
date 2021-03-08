"use strict";

const fs = require("fs");
const vm = require("vm");
const globby = require("globby");

const sandbox = vm.createContext();

const source = globby
  .sync(["standalone.js", "parser-*.js"], {
    cwd: process.env.PRETTIER_DIR,
    absolute: true,
  })
  .map((file) => fs.readFileSync(file, "utf8"))
  .join(";");

vm.runInContext(source, sandbox);

const allowedGlobalObjects = new Set(["prettier", "prettierPlugins"]);
const globalObjects = Object.keys(sandbox).filter(
  (property) => !allowedGlobalObjects.has(property)
);
if (globalObjects.length > 0) {
  throw new Error(
    `Global ${globalObjects
      .map(
        (property) =>
          `"${property}"(${Object.prototype.toString
            .call(sandbox[property])
            .slice(8, -1)})`
      )
      .join(", ")} should not be exposed.`
  );
}

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
